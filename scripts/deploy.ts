import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n===========================================");
  console.log("   DEPLOYMENT - ReciclaUPAO ICO");
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

  console.log("Desplegando ReciclaICO...");

  // @ts-expect-error
  const tokenPrice = hre.ethers.parseEther("0.1");
  // @ts-expect-error
  const softCap = hre.ethers.parseEther("50000");
  // @ts-expect-error
  const hardCap = hre.ethers.parseEther("500000");
  // @ts-expect-error
  const minPurchase = hre.ethers.parseEther("100");
  // @ts-expect-error
  const maxPurchase = hre.ethers.parseEther("100000");

  // @ts-expect-error
  const ReciclaICO = await hre.ethers.getContractFactory("ReciclaICO");
  const reciclaICO = await ReciclaICO.deploy(
    tokenAddress,
    tokenPrice,
    softCap,
    hardCap,
    minPurchase,
    maxPurchase
  );
  await reciclaICO.waitForDeployment();
  const icoAddress = await reciclaICO.getAddress();
  console.log("ReciclaICO desplegado en:", icoAddress, "\n");

  console.log("===========================================");
  console.log("   DEPLOYMENT COMPLETADO");
  console.log("===========================================\n");
  console.log("Direcciones desplegadas:");
  console.log("   ReciclaToken:", tokenAddress);
  console.log("   ReciclaICO:  ", icoAddress, "\n");

  console.log("Próximos pasos:");
  console.log("   1. Ejecuta: npm run setup");
  console.log("   2. Consulta info: npm run info\n");

  // Guardar direcciones en un archivo JSON
  const deploymentInfo = {
    network: "localhost",
    ReciclaToken: tokenAddress,
    ReciclaICO: icoAddress,
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
