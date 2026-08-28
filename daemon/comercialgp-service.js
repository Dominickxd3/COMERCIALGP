const { spawn } = require("child_process");
const path = require("path");

const appDir = path.resolve(__dirname, "..");
const port = process.env.PORT || "3010";

const nextBin = path.join(
  appDir,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);

const child = spawn(
  process.execPath,
  [nextBin, "start", "-p", port],
  {
    cwd: appDir,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: port,
    },
    stdio: "inherit",
    windowsHide: true,
  }
);

child.on("exit", (code) => {
  process.exit(code || 0);
});

process.on("SIGTERM", () => {
  child.kill();
});

process.on("SIGINT", () => {
  child.kill();
});