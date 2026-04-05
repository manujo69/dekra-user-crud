#!/usr/bin/env node

const { execSync } = require('child_process');

const hasVolta = canRun('volta --version');
const hasNvm = canRun('nvm --version') || canRun('. $NVM_DIR/nvm.sh && nvm --version');

if (!hasVolta && !hasNvm) {
  console.warn(`
⚠️  WARNING

This project uses Volta to manage the Node version.

Neither Volta nor nvm was found on your system.

Install Volta with:
  curl https://get.volta.sh | bash

Or proceed at your own risk using a different Node version.
`);
}

function canRun(cmd) {
  try {
    execSync(cmd, { stdio: 'ignore', shell: true });
    return true;
  } catch {
    return false;
  }
}
