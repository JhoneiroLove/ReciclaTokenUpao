import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Para ESM: obtener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para configurar el sistema ReciclaUPAO después del deployment
 */

// Configuración
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CHAIN_ID = process.env.CHAIN_ID || "31337";

// Leer direcciones desplegadas
function getDeployedAddresses(): { token: string } {
  try {
    const deploymentPath = path.join(
      __dirname,
      "..",
      "deployments",
      "localhost.json"
    );

    const data = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

    return {
      token: data.ReciclaToken,
    };
  } catch (error) {
    console.error("Error leyendo direcciones desplegadas:", error);
    throw new Error(
      "Primero debes desplegar los contratos con: npm run deploy:local"
    );
  }
}

// Leer ABIs
function getABI(contractName: string): any[] {
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
  console.log("\n===========================================");
  console.log("   CONFIGURACIÓN INICIAL - ReciclaUPAO");
  console.log("===========================================\n");

  // Conectar a la red
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const [admin, backend, user1, user2, user3] = await Promise.all([
    provider.getSigner(0), // Admin
    provider.getSigner(1), // Backend
    provider.getSigner(2), // Usuario demo 1
    provider.getSigner(3), // Usuario demo 2
    provider.getSigner(4), // Usuario demo 3
  ]);

  const addresses = getDeployedAddresses();

  console.log("📍 Dirección desplegada:");
  console.log(`   Token:  ${addresses.token}\n`);

  // Obtener ABI
  const tokenABI = getABI("ReciclaToken");

  // Conectar al contrato
  const token = new ethers.Contract(addresses.token, tokenABI, admin);

  const tokenAsBackend = token.connect(backend) as any;

  console.log("✅ PASO 1: Agregando usuarios a la whitelist...");

  const adminAddress = await admin.getAddress();
  const user1Address = await user1.getAddress();
  const user2Address = await user2.getAddress();
  const user3Address = await user3.getAddress();

  const whitelistTx = await tokenAsBackend.addMultipleToWhitelist(
    [adminAddress, user1Address, user2Address, user3Address],
    [
      "DNI-ADMIN-HASH",
      "DNI-12345678-HASH",
      "DNI-87654321-HASH",
      "DNI-11223344-HASH",
    ]
  );
  await whitelistTx.wait();

  console.log(`   ✅ Usuarios agregados a la whitelist:`);
  console.log(`      - Admin: ${adminAddress}`);
  console.log(`      - Usuario 1: ${user1Address}`);
  console.log(`      - Usuario 2: ${user2Address}`);
  console.log(`      - Usuario 3: ${user3Address}`);
  console.log(`   TX: ${whitelistTx.hash}\n`);

  console.log("✅ PASO 2: Acuñando tokens de prueba para recompensas...");

  const tokensForRewards = ethers.parseEther("1000");

  const mintTx = await tokenAsBackend.mintForActivity(
    user1Address,
    tokensForRewards,
    "Tokens de prueba - Actividad de reciclaje"
  );
  await mintTx.wait();

  console.log(
    `   ✅ Acuñados ${ethers.formatEther(tokensForRewards)} REC para usuario 1`
  );
  console.log(`   TX: ${mintTx.hash}\n`);

  console.log("✅ PASO 3: Verificando configuración...\n");

  const [tokenName, tokenSymbol, maxSupply, totalMinted, user1Balance] =
    await Promise.all([
      (token as any).name(),
      (token as any).symbol(),
      (token as any).MAX_SUPPLY(),
      (token as any).totalMinted(),
      (token as any).balanceOf(user1Address),
    ]);

  console.log("🪙 TOKEN:");
  console.log(`   Nombre:       ${tokenName}`);
  console.log(`   Símbolo:      ${tokenSymbol}`);
  console.log(`   Max Supply:   ${ethers.formatEther(maxSupply)} REC`);
  console.log(`   Total Acuñado: ${ethers.formatEther(totalMinted)} REC`);
  console.log(
    `   Balance Usuario 1: ${ethers.formatEther(user1Balance)} REC\n`
  );

  console.log("===========================================");
  console.log("   ✅ CONFIGURACIÓN COMPLETADA");
  console.log("===========================================\n");

  console.log("🎯 Próximos pasos:");
  console.log("   1. Ver info: npm run info");
  console.log("   2. Registrar actividad: npm run recycle");
  console.log("   3. Canjear recompensa: npm run redeem");
  console.log("   4. Ver balances: npm run balances\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
