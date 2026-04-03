#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  execSync('volta --version', { stdio: 'ignore' });
} catch (err) {
  console.warn(`
⚠️  AVISO IMPORTANTE

Este proyecto está configurado para usar Volta para gestionar la versión de Node.

No se ha encontrado Volta en tu sistema.

Instálalo con:
  curl https://get.volta.sh | bash

O continúa bajo tu propia responsabilidad usando otra versión de Node.
`);
}
