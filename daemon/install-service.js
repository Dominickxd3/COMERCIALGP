const path = require("path");
const { Service } = require("node-windows");

const svc = new Service({
  name: "ComercialGP",
  description: "Dashboard ComercialGP - Next.js",
  script: path.join(__dirname, "comercialgp-service.js"),
  workingDirectory: path.resolve(__dirname, ".."),
  env: [
    {
      name: "NODE_ENV",
      value: "production",
    },
    {
      name: "PORT",
      value: "3010",
    },
  ],
});

svc.on("install", () => {
  console.log("Servicio ComercialGP instalado.");
  svc.start();
});

svc.on("alreadyinstalled", () => {
  console.log("El servicio ComercialGP ya existe.");
});

svc.on("start", () => {
  console.log("Servicio ComercialGP iniciado.");
});

svc.install();