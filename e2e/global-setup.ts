import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
  execSync('RAILS_ENV=test bin/rails e2e:ensure_user', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
}
