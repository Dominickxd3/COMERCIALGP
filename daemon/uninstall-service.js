const path = require("path");
const { Service } = require("node-windows");

const svc = new Service({
  name: "ComercialGP",
  script: path.join(__dirname, "comercialgp-service.js"),
});

svc.on("uninstall", () => {
  console.log("Servicio ComercialGP desinstalado.");
});

svc.uninstall();