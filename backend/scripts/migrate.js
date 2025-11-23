import fs from 'fs';
import path from 'path';
import url from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../migrations');

async function loadMigrations() {
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.js')).sort();
  return Promise.all(files.map(async (file) => import(path.join(migrationsDir, file))));
}

async function connect() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to run migrations');
  }
  await mongoose.connect(process.env.MONGODB_URI);
}

async function disconnect() {
  await mongoose.connection.close();
}

async function applyMigrations(direction = 'up') {
  await connect();
  const migrations = await loadMigrations();
  const migrationModel = mongoose.connection.collection('migrations');

  if (direction === 'down') {
    const lastApplied = await migrationModel.find().sort({ appliedAt: -1 }).limit(1).toArray();
    if (!lastApplied.length) {
      console.log('No migrations to roll back.');
      await disconnect();
      return;
    }

    const migration = migrations.find((item) => item.name === lastApplied[0].name);
    if (!migration?.down) {
      throw new Error(`Migration ${lastApplied[0].name} does not have a down method.`);
    }

    console.log(`Reverting migration: ${lastApplied[0].name}`);
    await migration.down();
    await migrationModel.deleteOne({ name: lastApplied[0].name });
    await disconnect();
    console.log('Rollback completed.');
    return;
  }

  for (const migration of migrations) {
    const alreadyApplied = await migrationModel.findOne({ name: migration.name });
    if (alreadyApplied) {
      continue;
    }
    if (!migration?.up) {
      throw new Error(`Migration ${migration.name} is missing an up method.`);
    }
    console.log(`Applying migration: ${migration.name}`);
    await migration.up();
    await migrationModel.insertOne({ name: migration.name, appliedAt: new Date() });
  }

  await disconnect();
  console.log('All pending migrations applied.');
}

const directionFlag = process.argv.find((arg) => arg.startsWith('--direction='));
const direction = directionFlag ? directionFlag.split('=')[1] : 'up';

applyMigrations(direction).catch((error) => {
  console.error(error);
  process.exit(1);
});
