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
  console.log("\n🏛️ Asignando rol VALIDATOR a ONGs...");
  console.log("━".repeat(60));

  // Wallets de las ONGs (Account #2 y #3 - SIEMPRE LAS MISMAS con mnemonic determinista)
  // Ver ACCOUNTS.md para más detalles
  const ong1Address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Account #2
  const ong2Address = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // Account #3

  // Conectar con el admin (Account #0)
  const [admin] = await ethers.getSigners();

  const addresses = getDeployedAddresses();
  const tokenABI = getABI("ReciclaToken");
  const token = new ethers.Contract(addresses.token, tokenABI, admin) as any;

  console.log(`\n📍 Contrato: ${addresses.token}`);
  console.log(`👤 ONG 1:     ${ong1Address}`);
  console.log(`👤 ONG 2:     ${ong2Address}\n`);

  // Obtener el rol VALIDATOR_ROLE
  const VALIDATOR_ROLE = await token.VALIDATOR_ROLE();

  console.log("📝 Asignando rol VALIDATOR_ROLE...\n");

  // 1. ONG 1
  console.log("1️⃣ Asignando VALIDATOR_ROLE a ONG 1...");
  const tx1 = await token.grantRole(VALIDATOR_ROLE, ong1Address);
  await tx1.wait();
  console.log(`   ✅ TX: ${tx1.hash}`);

  // 2. ONG 2
  console.log("\n2️⃣ Asignando VALIDATOR_ROLE a ONG 2...");
  const tx2 = await token.grantRole(VALIDATOR_ROLE, ong2Address);
  await tx2.wait();
  console.log(`   ✅ TX: ${tx2.hash}`);

  // Verificar roles
  console.log("\n🔍 Verificando roles...\n");

  const ong1HasRole = await token.hasRole(VALIDATOR_ROLE, ong1Address);
  const ong2HasRole = await token.hasRole(VALIDATOR_ROLE, ong2Address);

  console.log(`   ONG 1 tiene VALIDATOR_ROLE: ${ong1HasRole ? "✅" : "❌"}`);
  console.log(`   ONG 2 tiene VALIDATOR_ROLE: ${ong2HasRole ? "✅" : "❌"}`);

  console.log("\n" + "━".repeat(60));
  console.log("✅ Roles VALIDATOR asignados exitosamente!");
  console.log(
    "\n💡 Ahora las ONGs pueden aprobar/rechazar actividades de reciclaje"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
