import { execSync } from 'node:child_process';
import * as path from 'node:path';

export default async function globalSetup() {
  execSync('RAILS_ENV=test bin/rails e2e:ensure_user', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
}
