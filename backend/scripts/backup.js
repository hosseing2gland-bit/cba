import { execFile } from 'child_process';
import { mkdirSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups', timestamp);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MONGODB_URI is required to run backups');
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

execFile('mongodump', ['--uri', mongoUri, '--out', outputDir], (error, stdout, stderr) => {
  if (error) {
    console.error('mongodump failed:', stderr || error.message);
    process.exit(1);
  }
  console.log(stdout || 'Backup completed.');
  console.log(`Backup stored at: ${outputDir}`);
});
