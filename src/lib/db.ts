import sql from "mssql";

type GlobalSqlState = typeof globalThis & {
  __comercialSqlPoolPromise?: Promise<sql.ConnectionPool>;
};

function getRequiredEnv(name: string) {
  const aliasMap: Record<string, string> = {
    "DB_SERVER": "SQL_SERVER",
    "DB_USER": "SQL_USER",
    "DB_PASSWORD": "SQL_PASSWORD",
    "DB_DATABASE": "SQL_DATABASE",
    "DB_PORT": "SQL_PORT"
  };
  const alias = aliasMap[name];
  const value = process.env[name] || (alias ? process.env[alias] : undefined);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}${alias ? ` or ${alias}` : ""}`);
  }
  return value;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function getSqlConfig(): sql.config {
  const server = process.env.DB_SERVER || process.env.SQL_SERVER;
  const user = process.env.DB_USER || process.env.SQL_USER;
  const password = process.env.DB_PASSWORD || process.env.SQL_PASSWORD;
  const database = process.env.DB_DATABASE || process.env.SQL_DATABASE || "dbWEB_ComercialBI";
  const portStr = process.env.DB_PORT || process.env.SQL_PORT;
  const encryptVal = process.env.DB_ENCRYPT || process.env.SQL_ENCRYPT;
  const trustCertVal = process.env.DB_TRUST_SERVER_CERTIFICATE || process.env.SQL_TRUST_SERVER_CERTIFICATE;

  if (!server) throw new Error("Missing required environment variable: SQL_SERVER (or DB_SERVER)");
  if (!user) throw new Error("Missing required environment variable: SQL_USER (or DB_USER)");
  if (!password) throw new Error("Missing required environment variable: SQL_PASSWORD (or DB_PASSWORD)");

  return {
    server: server,
    port: Number(portStr ?? 1433),
    database: database,
    user: user,
    password: password,
    requestTimeout: 120000, // 2 minutes to prevent SP timeout
    options: {
      encrypt: parseBoolean(encryptVal, false),
      trustServerCertificate: parseBoolean(trustCertVal, true),
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30_000,
    },
  };
}

export async function getSqlPool() {
  const globalState = globalThis as GlobalSqlState;

  if (!globalState.__comercialSqlPoolPromise) {
    const pool = new sql.ConnectionPool(getSqlConfig());
    globalState.__comercialSqlPoolPromise = pool.connect().catch((error) => {
      globalState.__comercialSqlPoolPromise = undefined;
      throw new Error(
        `Failed to connect to SQL Server dbWEB_ComercialBI: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    });
  }

  return globalState.__comercialSqlPoolPromise;
}

export { sql };
