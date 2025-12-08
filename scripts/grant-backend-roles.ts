import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Configuración
const NETWORK = process.env.BLOCKCHAIN_NETWORK || "localhost";
const DEPLOYMENTS_PATH = path.join(__dirname, "..", "deployments");

function getDeployedAddresses() {
  const deploymentFile = path.join(DEPLOYMENTS_PATH, `${NETWORK}.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`No se encontró el archivo de deployment para ${NETWORK}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  return {
    token: deployment.ReciclaToken,
  };
}

function getABI(contractName: string) {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return artifact.abi;
}

async function main() {
  console.log("\n🔐 Asignando roles al backend...");
  console.log("━".repeat(60));

  // Wallet del backend (Account #1 - SIEMPRE LA MISMA con mnemonic determinista)
  // Ver ACCOUNTS.md para más detalles
  const backendAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  // Conectar con el admin (Account #0)
  const [admin] = await ethers.getSigners();

  const addresses = getDeployedAddresses();
  const tokenABI = getABI("ReciclaToken");
  const token = new ethers.Contract(addresses.token, tokenABI, admin) as any;

  console.log(`\n📍 Contrato: ${addresses.token}`);
  console.log(`👤 Backend:  ${backendAddress}\n`);

  // Obtener los roles
  const PROPOSER_ROLE = await token.PROPOSER_ROLE();
  const WHITELIST_MANAGER_ROLE = await token.WHITELIST_MANAGER_ROLE();
  const BURNER_ROLE = await token.BURNER_ROLE();

  console.log("📝 Asignando roles...\n");

  // 1. PROPOSER_ROLE
  console.log("1️⃣ Asignando PROPOSER_ROLE (proponer actividades)...");
  const tx1 = await token.grantRole(PROPOSER_ROLE, backendAddress);
  await tx1.wait();
  console.log(`   ✅ TX: ${tx1.hash}`);

  // 2. WHITELIST_MANAGER_ROLE
  console.log("\n2️⃣ Asignando WHITELIST_MANAGER_ROLE (registrar usuarios)...");
  const tx2 = await token.grantRole(WHITELIST_MANAGER_ROLE, backendAddress);
  await tx2.wait();
  console.log(`   ✅ TX: ${tx2.hash}`);

  // 3. BURNER_ROLE
  console.log("\n3️⃣ Asignando BURNER_ROLE (quemar tokens en canjes)...");
  const tx3 = await token.grantRole(BURNER_ROLE, backendAddress);
  await tx3.wait();
  console.log(`   ✅ TX: ${tx3.hash}`);

  console.log("\n" + "━".repeat(60));
  console.log("✅ Todos los roles asignados exitosamente!");
  console.log("━".repeat(60) + "\n");

  // Verificar roles
  console.log("🔍 Verificando roles...");
  const hasProposer = await token.hasRole(PROPOSER_ROLE, backendAddress);
  const hasWhitelist = await token.hasRole(
    WHITELIST_MANAGER_ROLE,
    backendAddress
  );
  const hasBurner = await token.hasRole(BURNER_ROLE, backendAddress);

  console.log(`   PROPOSER_ROLE:          ${hasProposer ? "✅" : "❌"}`);
  console.log(`   WHITELIST_MANAGER_ROLE: ${hasWhitelist ? "✅" : "❌"}`);
  console.log(`   BURNER_ROLE:            ${hasBurner ? "✅" : "❌"}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
