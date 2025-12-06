import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n===========================================");
  console.log("   DEPLOYMENT - ReciclaUPAO Token System");
  console.log("===========================================\n");

  // @ts-expect-error
  const [deployer] = await hre.ethers.getSigners();
  console.log("Desplegando contratos con la cuenta:", deployer.address);
  console.log(
    "Balance de la cuenta:",
    // @ts-expect-error
    hre.ethers.formatEther(
      // @ts-expect-error
      await hre.ethers.provider.getBalance(deployer.address)
    ),
    "ETH\n"
  );

  const adminAddress = deployer.address;
  const backendAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  console.log("Desplegando ReciclaToken...");
  // @ts-expect-error
  const ReciclaToken = await hre.ethers.getContractFactory("ReciclaToken");
  const reciclaToken = await ReciclaToken.deploy(adminAddress, backendAddress);
  await reciclaToken.waitForDeployment();
  const tokenAddress = await reciclaToken.getAddress();
  console.log("ReciclaToken desplegado en:", tokenAddress, "\n");

  console.log("===========================================");
  console.log("   DEPLOYMENT COMPLETADO");
  console.log("===========================================\n");
  console.log("Dirección desplegada:");
  console.log("   ReciclaToken:", tokenAddress, "\n");

  console.log("Próximos pasos:");
  console.log("   1. Ejecuta: npm run setup");
  console.log("   2. Consulta info: npm run info\n");

  // Guardar direcciones en un archivo JSON
  const deploymentInfo = {
    network: "localhost",
    ReciclaToken: tokenAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "localhost.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Direcciones guardadas en: deployments/localhost.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
