import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Team from '../src/models/Team.js';
import Profile from '../src/models/Profile.js';

dotenv.config();

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

async function connect() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to seed the database');
  }
  await mongoose.connect(process.env.MONGODB_URI);
}

async function createAdminUser() {
  const existing = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
  if (existing) {
    console.log('Admin user already exists, skipping creation.');
    return existing;
  }

  const admin = await User.create({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    name: DEFAULT_ADMIN_NAME,
    role: 'admin',
  });

  console.log(`Admin user created: ${admin.email}`);
  return admin;
}

async function createSeedData(admin) {
  const team = await Team.findOneAndUpdate(
    { name: 'Core Team' },
    { name: 'Core Team', owner: admin._id },
    { new: true, upsert: true },
  );

  await Profile.findOneAndUpdate(
    { name: 'Demo Profile' },
    {
      name: 'Demo Profile',
      owner: admin._id,
      proxy: { type: 'http', host: 'proxy.example.com', port: 8080 },
      webrtc: { mode: 'disable' },
      timezone: 'UTC',
      language: 'en-US',
    },
    { upsert: true },
  );

  console.log(`Seed data linked to team ${team.name}`);
}

async function seed() {
  await connect();
  try {
    const admin = await createAdminUser();
    await createSeedData(admin);
    console.log('Database seeded successfully.');
  } finally {
    await mongoose.connection.close();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
