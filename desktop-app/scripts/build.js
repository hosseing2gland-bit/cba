import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));

const distDir = path.join(rootDir, 'dist');
const bundleDir = path.join(distDir, `antidetect-desktop-${pkg.version}-linux`);
const electronDist = path.join(rootDir, 'node_modules', 'electron', 'dist');

function clean() {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(bundleDir, { recursive: true });
}

function copyElectronRuntime() {
  if (!fs.existsSync(electronDist)) {
    throw new Error('Electron runtime not found. Run npm install first.');
  }
  fs.cpSync(electronDist, bundleDir, { recursive: true });
}

function copyAppSources() {
  const appResources = path.join(bundleDir, 'resources', 'app');
  fs.mkdirSync(appResources, { recursive: true });

  const filesToCopy = ['main', 'renderer', 'browser-core'];
  filesToCopy.forEach((entry) => {
    fs.cpSync(path.join(rootDir, entry), path.join(appResources, entry), { recursive: true });
  });

  const minimalPackage = {
    name: pkg.name,
    version: pkg.version,
    main: pkg.main,
    type: pkg.type,
    dependencies: pkg.dependencies,
  };
  fs.writeFileSync(path.join(appResources, 'package.json'), `${JSON.stringify(minimalPackage, null, 2)}\n`);
}

function createArchive() {
  const archiveName = `antidetect-desktop-${pkg.version}-linux.tar.gz`;
  execFileSync('tar', ['-czf', archiveName, path.basename(bundleDir)], { cwd: distDir });
  console.log(`Created ${path.join(distDir, archiveName)}`);
}

clean();
copyElectronRuntime();
copyAppSources();
createArchive();
