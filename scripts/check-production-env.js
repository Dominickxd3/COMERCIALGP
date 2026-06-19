const fs = require('fs');
const path = require('path');

// Intentar cargar .env.production de forma manual si existe
const envProductionPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(envProductionPath)) {
  const envContent = fs.readFileSync(envProductionPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const requiredEnv = [
  'SQL_SERVER',
  'SQL_DATABASE',
  'SQL_USER',
  'SQL_PASSWORD',
  'SQL_PORT'
];

let missing = [];

requiredEnv.forEach(envVar => {
  if (!process.env[envVar]) {
    missing.push(envVar);
  }
});

if (missing.length > 0) {
  console.error('\x1b[31mError: Faltan variables de entorno requeridas para producción:\x1b[0m');
  missing.forEach(envVar => console.error(`  - ${envVar}`));
  process.exit(1);
} else {
  console.log('\x1b[32m✔ Todas las variables de entorno de producción requeridas están presentes.\x1b[0m');
  console.log(`  SQL_SERVER: ${process.env.SQL_SERVER}`);
  console.log(`  SQL_DATABASE: ${process.env.SQL_DATABASE}`);
  console.log(`  SQL_USER: ${process.env.SQL_USER}`);
  console.log(`  SQL_PORT: ${process.env.SQL_PORT}`);
  console.log('  SQL_PASSWORD: [PROTEGIDO]');
  process.exit(0);
}
