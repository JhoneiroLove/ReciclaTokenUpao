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
function getDeployedAddresses(): { token: string; ico: string } {
  try {
    const deploymentPath = path.join(
      __dirname,
      "..",
      "ignition",
      "deployments",
      `chain-${CHAIN_ID}`,
      "deployed_addresses.json"
    );

    const data = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

    return {
      token: data["ReciclaModule#ReciclaToken"],
      ico: data["ReciclaModule#ReciclaICO"],
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

  console.log("Direcciones desplegadas:");
  console.log(`   Token:  ${addresses.token}`);
  console.log(`   ICO:    ${addresses.ico}\n`);

  // Obtener ABIs
  const tokenABI = getABI("ReciclaToken");
  const icoABI = getABI("ReciclaICO");

  // Conectar a los contratos
  const token = new ethers.Contract(addresses.token, tokenABI, admin);
  const ico = new ethers.Contract(addresses.ico, icoABI, admin);

  console.log("PASO 1: Acuñando tokens para la ICO...");

  const tokensForICO = ethers.parseEther("3000000"); // 3 millones de tokens

  // Conectar como backend (tiene MINTER_ROLE)
  const tokenAsBackend = token.connect(backend) as any;

  const mintTx = await tokenAsBackend.mintForActivity(
    await admin.getAddress(),
    tokensForICO,
    "Tokens reservados para ICO pública"
  );
  await mintTx.wait();

  console.log(`   Acuñados ${ethers.formatEther(tokensForICO)} REC`);
  console.log(`   TX: ${mintTx.hash}\n`);

  console.log("PASO 2: Transfiriendo tokens al contrato ICO...");

  const transferTx = await (token as any).transfer(addresses.ico, tokensForICO);
  await transferTx.wait();

  const icoBalance = await (token as any).balanceOf(addresses.ico);
  console.log(`   Balance del ICO: ${ethers.formatEther(icoBalance)} REC`);
  console.log(`   TX: ${transferTx.hash}\n`);

  console.log("PASO 3: Agregando usuarios demo a la whitelist...");

  const user1Address = await user1.getAddress();
  const user2Address = await user2.getAddress();
  const user3Address = await user3.getAddress();

  // Agregar usuarios en batch
  const whitelistTx = await tokenAsBackend.addMultipleToWhitelist(
    [user1Address, user2Address, user3Address],
    [
      "DNI-12345678-HASH", // DNI hasheado del usuario 1
      "DNI-87654321-HASH", // DNI hasheado del usuario 2
      "DNI-11223344-HASH", // DNI hasheado del usuario 3
    ]
  );
  await whitelistTx.wait();

  console.log(`   Usuarios agregados a whitelist:`);
  console.log(`      - ${user1Address}`);
  console.log(`      - ${user2Address}`);
  console.log(`      - ${user3Address}`);
  console.log(`   TX: ${whitelistTx.hash}\n`);

  console.log("PASO 4: Iniciando la ICO...");

  const icoDuration = 60 * 60 * 24 * 30; // 30 días en segundos
  const startTx = await (ico as any).startICO(icoDuration);
  await startTx.wait();

  const startTime = await (ico as any).startTime();
  const endTime = await (ico as any).endTime();

  console.log(`   ICO iniciada`);
  console.log(
    `   Inicio: ${new Date(Number(startTime) * 1000).toLocaleString()}`
  );
  console.log(
    `   Fin:    ${new Date(Number(endTime) * 1000).toLocaleString()}`
  );
  console.log(`   TX: ${startTx.hash}\n`);

  console.log("PASO 5: Verificando configuración...\n");

  const [
    tokenName,
    tokenSymbol,
    maxSupply,
    totalMinted,
    tokenPrice,
    softCap,
    hardCap,
  ] = await Promise.all([
    (token as any).name(),
    (token as any).symbol(),
    (token as any).MAX_SUPPLY(),
    (token as any).totalMinted(),
    (ico as any).tokenPrice(),
    (ico as any).softCap(),
    (ico as any).hardCap(),
  ]);

  console.log("Información del Token:");
  console.log(`   Nombre:       ${tokenName}`);
  console.log(`   Símbolo:      ${tokenSymbol}`);
  console.log(`   Max Supply:   ${ethers.formatEther(maxSupply)} REC`);
  console.log(`   Total Acuñado: ${ethers.formatEther(totalMinted)} REC\n`);

  console.log("Información de la ICO:");
  console.log(`   Precio:       ${ethers.formatEther(tokenPrice)} MATIC/REC`);
  console.log(`   Soft Cap:     ${ethers.formatEther(softCap)} MATIC`);
  console.log(`   Hard Cap:     ${ethers.formatEther(hardCap)} MATIC`);
  console.log(`   Descuento S1: 15%`);
  console.log(`   Descuento S2: 10%`);
  console.log(`   Descuento S3: 5%\n`);

  console.log("===========================================");
  console.log("   CONFIGURACIÓN COMPLETADA");
  console.log("===========================================\n");

  console.log("Próximos pasos:");
  console.log("   1. Ejecuta: npm run test:buy-tokens");
  console.log("   2. Monitorea: npm run events:live");
  console.log("   3. Consulta balances: npm run balances\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
