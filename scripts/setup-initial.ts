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
  const [admin, backend, validator1, validator2, user1, user2, user3] =
    await Promise.all([
      provider.getSigner(0), // Admin
      provider.getSigner(1), // Backend (PROPOSER_ROLE)
      provider.getSigner(2), // Validador 1 (Admin Ambiental UPAO)
      provider.getSigner(3), // Validador 2 (Centro de Acopio)
      provider.getSigner(4), // Usuario demo 1
      provider.getSigner(5), // Usuario demo 2
      provider.getSigner(6), // Usuario demo 3
    ]);

  const addresses = getDeployedAddresses();

  console.log("📍 Direccion desplegada:");
  console.log(`   Token:  ${addresses.token}\n`);

  // Obtener ABI
  const tokenABI = getABI("ReciclaToken");

  // Conectar al contrato
  const token = new ethers.Contract(addresses.token, tokenABI, admin);

  const tokenAsBackend = token.connect(backend) as any;

  console.log("✅ PASO 1: Otorgando roles de validador...");

  const validator1Address = await validator1.getAddress();
  const validator2Address = await validator2.getAddress();

  // Obtener VALIDATOR_ROLE
  const VALIDATOR_ROLE = await (token as any).VALIDATOR_ROLE();

  // Otorgar roles
  const grantRole1Tx = await (token as any).grantRole(
    VALIDATOR_ROLE,
    validator1Address
  );
  await grantRole1Tx.wait();

  const grantRole2Tx = await (token as any).grantRole(
    VALIDATOR_ROLE,
    validator2Address
  );
  await grantRole2Tx.wait();

  console.log(`   ✅ VALIDATOR_ROLE otorgado a:`);
  console.log(`      - Validador 1 (Admin Ambiental): ${validator1Address}`);
  console.log(`      - Validador 2 (Centro Acopio):   ${validator2Address}`);
  console.log(`   TX1: ${grantRole1Tx.hash}`);
  console.log(`   TX2: ${grantRole2Tx.hash}\n`);

  console.log("✅ PASO 2: Agregando usuarios a la whitelist...");

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

  console.log("✅ PASO 3: Creando actividad de reciclaje de prueba...");

  const pesoKg = 50; // 50 kg de plástico
  const tipoMaterial = "plastico"; // 15 REC/kg = 750 REC
  const evidenciaIPFS = "QmTestEvidence123...abc";

  // Backend propone actividad
  const proposalTx = await tokenAsBackend.proponerActividad(
    user1Address,
    pesoKg,
    tipoMaterial,
    evidenciaIPFS
  );
  await proposalTx.wait();

  console.log(`   ✅ Actividad propuesta para Usuario 1:`);
  console.log(`      - Material: ${tipoMaterial}`);
  console.log(`      - Peso: ${pesoKg} kg`);
  console.log(`      - Tokens calculados: 750 REC (50kg × 15 REC/kg)`);
  console.log(`      - Evidencia IPFS: ${evidenciaIPFS}`);
  console.log(`   TX: ${proposalTx.hash}\n`);

  console.log("✅ PASO 4: Validadores aprueban la actividad...");

  // Validador 1 aprueba
  const tokenAsValidator1 = token.connect(validator1) as any;
  const approve1Tx = await tokenAsValidator1.aprobarActividad(0);
  await approve1Tx.wait();

  console.log(`   ✅ Validador 1 aprobó (1/2)`);
  console.log(`   TX: ${approve1Tx.hash}`);

  // Validador 2 aprueba (esto ejecutará automáticamente el minting)
  const tokenAsValidator2 = token.connect(validator2) as any;
  const approve2Tx = await tokenAsValidator2.aprobarActividad(0);
  await approve2Tx.wait();

  console.log(`   ✅ Validador 2 aprobó (2/2) - ¡Tokens acuñados!`);
  console.log(`   TX: ${approve2Tx.hash}\n`);

  console.log("✅ PASO 5: Verificando configuración...\n");

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
