import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("\n===========================================");
  console.log("   DEPLOYMENT - Polygon Amoy Testnet");
  console.log("===========================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Desplegando con cuenta:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC\n");

  if (balance < hre.ethers.parseEther("0.04")) {
    throw new Error("Necesitas al menos 0.04 MATIC para deployment");
  }

  const adminAddress = deployer.address;
  const backendAddress = process.env.BACKEND_ADDRESS;

  if (!backendAddress) {
    throw new Error("BACKEND_ADDRESS no configurada en .env");
  }

  console.log("Admin Address:  ", adminAddress);
  console.log("Backend Address:", backendAddress, "\n");

  // Deploy ReciclaToken
  console.log("Desplegando ReciclaToken...");
  const ReciclaToken = await hre.ethers.getContractFactory("ReciclaToken");
  const reciclaToken = await ReciclaToken.deploy(adminAddress, backendAddress);
  await reciclaToken.waitForDeployment();

  // Esperar confirmaciones
  await reciclaToken.deploymentTransaction()?.wait(5);

  const tokenAddress = await reciclaToken.getAddress();
  console.log("ReciclaToken:", tokenAddress, "\n");

  // Deploy ReciclaICO
  console.log("Desplegando ReciclaICO...");
  const tokenPrice = hre.ethers.parseEther("0.1");
  const softCap = hre.ethers.parseEther("50000");
  const hardCap = hre.ethers.parseEther("500000");
  const minPurchase = hre.ethers.parseEther("100");
  const maxPurchase = hre.ethers.parseEther("100000");

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
  await reciclaICO.deploymentTransaction()?.wait(5);

  const icoAddress = await reciclaICO.getAddress();
  console.log("ReciclaICO:", icoAddress, "\n");

  // Guardar addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    ReciclaToken: tokenAddress,
    ReciclaICO: icoAddress,
    deployer: deployer.address,
    backend: backendAddress,
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("===========================================");
  console.log("   DEPLOYMENT COMPLETADO");
  console.log("===========================================");
  console.log("\n Actualiza application.properties:");
  console.log(`blockchain.token-address=${tokenAddress}`);
  console.log(`blockchain.ico-address=${icoAddress}\n`);

  console.log("Verifica en PolygonScan:");
  console.log(`https://amoy.polygonscan.com/address/${tokenAddress}`);
  console.log(`https://amoy.polygonscan.com/address/${icoAddress}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
