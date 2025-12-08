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
  console.log("\n🏢 Asignando rol PROPOSER al Centro de Acopio...");
  console.log("━".repeat(60));

  // Wallet del Centro de Acopio (Account #4)
  const centroAddress = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

  // Conectar con el admin (Account #0)
  const [admin] = await ethers.getSigners();

  const addresses = getDeployedAddresses();
  const tokenABI = getABI("ReciclaToken");
  const token = new ethers.Contract(addresses.token, tokenABI, admin) as any;

  console.log(`\n📍 Contrato: ${addresses.token}`);
  console.log(`🏢 Centro de Acopio: ${centroAddress}\n`);

  // Obtener el rol PROPOSER
  const PROPOSER_ROLE = await token.PROPOSER_ROLE();

  console.log("📝 Asignando rol PROPOSER_ROLE...\n");

  // Asignar rol PROPOSER al Centro de Acopio
  console.log(
    "✨ Asignando PROPOSER_ROLE (proponer actividades en nombre de estudiantes)..."
  );
  const tx = await token.grantRole(PROPOSER_ROLE, centroAddress);
  await tx.wait();
  console.log(`   ✅ TX: ${tx.hash}`);

  // Verificar rol
  console.log("\n🔍 Verificando rol...\n");
  const hasProposer = await token.hasRole(PROPOSER_ROLE, centroAddress);
  console.log(
    `   Centro de Acopio tiene PROPOSER_ROLE: ${hasProposer ? "✅" : "❌"}`
  );

  console.log("\n" + "━".repeat(60));
  console.log("✅ Rol PROPOSER asignado exitosamente al Centro de Acopio!");
  console.log(
    "\n💡 Ahora el Centro puede registrar actividades en nombre de estudiantes"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
