/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const envContent = fs.readFileSync(filePath, "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(__dirname, "..", ".env.production"));

const requiredEnv = [
  "SQL_SERVER",
  "SQL_DATABASE",
  "SQL_USER",
  "SQL_PASSWORD",
  "SQL_PORT",
];

const missing = requiredEnv.filter((envVar) => !process.env[envVar]);

if (missing.length > 0) {
  console.error("Error: faltan variables de entorno requeridas para produccion:");
  for (const envVar of missing) {
    console.error(`- ${envVar}`);
  }
  process.exit(1);
}

console.log("OK: variables de entorno de produccion completas.");
console.log(`SQL_SERVER: ${process.env.SQL_SERVER}`);
console.log(`SQL_DATABASE: ${process.env.SQL_DATABASE}`);
console.log(`SQL_USER: ${process.env.SQL_USER}`);
console.log(`SQL_PORT: ${process.env.SQL_PORT}`);
console.log("SQL_PASSWORD: [PROTEGIDO]");
