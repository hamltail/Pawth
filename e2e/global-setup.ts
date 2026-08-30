import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
  if (process.env.BASE_URL) {
    return;
  }

  execSync('RAILS_ENV=test bin/rails db:prepare', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  execSync('RAILS_ENV=test bin/rails e2e:ensure_user', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
}
