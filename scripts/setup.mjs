#!/usr/bin/env node
/**
 * One-command local setup for Islamabad Optics / OptOps.
 * Usage (from repo root): npm run setup
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function run(cmd, args, cwd) {
  console.log(`\n> ${cmd} ${args.join(' ')}  (${cwd})`);
  const result = spawnSync(cmd, args, {
    cwd: join(root, cwd),
    stdio: 'inherit',
    shell: isWin,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureEnv(relDir) {
  const dir = join(root, relDir);
  const envPath = join(dir, '.env');
  const examplePath = join(dir, '.env.example');
  if (existsSync(envPath)) {
    console.log(`✓ ${relDir}/.env already exists`);
    return;
  }
  if (!existsSync(examplePath)) {
    console.warn(`! Missing ${relDir}/.env.example — skip`);
    return;
  }
  copyFileSync(examplePath, envPath);
  console.log(`✓ Created ${relDir}/.env from .env.example — edit DATABASE_URL and secrets`);
}

console.log('Islamabad Optics — local setup\n');

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 20) {
  console.error(`Node.js 20+ required (found ${process.version}).`);
  process.exit(1);
}
console.log(`✓ Node ${process.version}`);

ensureEnv('backend');
ensureEnv('frontend');
ensureEnv('frontend-ecommerce');

for (const pkg of ['backend', 'frontend', 'frontend-ecommerce']) {
  run(npmCmd, ['install'], pkg);
}

run(npmCmd, ['run', 'prisma:generate'], 'backend');

console.log(`
────────────────────────────────────────
Setup finished.

1. Edit backend/.env
   - Set DATABASE_URL to local Postgres, or ask a teammate for the shared Prisma Accelerate URL.

2. Create tables (from repo root):
   npm run prisma:migrate

3. Seed super admin (optional):
   npm run prisma:seed

4. Start apps in 3 terminals:
   npm run dev:backend      → http://localhost:5000
   npm run dev:frontend     → http://localhost:5173  (dashboard)
   npm run dev:ecommerce    → http://localhost:3001  (storefront)

Default seed super admin (after prisma:seed):
  email:    kashif.devfe@gmail.com
  password: optops123
  login:    http://localhost:5173/admin/login

Company staff signup/login:
  http://localhost:5173/signup
  http://localhost:5173/login
────────────────────────────────────────
`);
