import { ethers } from "hardhat";

/**
 * Script para configurar roles en ReciclaToken desplegado en Sepolia
 * Asigna roles a wallets específicas para cada actor del sistema
 *
 * Ejecutar: npx hardhat run scripts/setup-roles-sepolia.ts --network sepolia
 */

async function main() {
  console.log("🔧 Configurando roles en ReciclaToken (Sepolia)...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Ejecutando con cuenta:", deployer.address);
  console.log("");

  // ==================== CONFIGURACIÓN ====================
  // Dirección del contrato desplegado
  const tokenAddress = "0x6Ee68256eF29096e8Bc66c14494E5f58650488DD";

  // Wallets específicas según application.properties
  const adminWallet = "0x7386e0F040439A743e51e156A20C88792763cBCd"; // Admin/Backend
  const validator1Wallet = "0x7E2425e845fB9432Ac32FA4A21B130Ec954a1efE"; // ONG Ambiental
  const validator2Wallet = "0xb09b1921526931118A10e5DCb697C264893DC174"; // ONG 2
  const centroWallet = "0xc3E57bd884224003A0f2dBa1F550B9e3F7cd38Ce"; // Centro de Acopio

  const ReciclaToken = await ethers.getContractAt("ReciclaToken", tokenAddress);

  // Obtener roles
  const VALIDATOR_ROLE = await ReciclaToken.VALIDATOR_ROLE();
  const PROPOSER_ROLE = await ReciclaToken.PROPOSER_ROLE();
  const BURNER_ROLE = await ReciclaToken.BURNER_ROLE();
  const WHITELIST_MANAGER_ROLE = await ReciclaToken.WHITELIST_MANAGER_ROLE();

  console.log("📋 Roles definidos:");
  console.log("  VALIDATOR_ROLE:", VALIDATOR_ROLE);
  console.log("  PROPOSER_ROLE:", PROPOSER_ROLE);
  console.log("  BURNER_ROLE:", BURNER_ROLE);
  console.log("  WHITELIST_MANAGER_ROLE:", WHITELIST_MANAGER_ROLE);
  console.log("");

  console.log("👥 Wallets configuradas:");
  console.log("  Admin/Backend:", adminWallet);
  console.log("  Validador 1 (ONG Ambiental):", validator1Wallet);
  console.log("  Validador 2 (ONG 2):", validator2Wallet);
  console.log("  Centro de Acopio:", centroWallet);
  console.log("");

  // ==================== ASIGNACIÓN DE ROLES ====================

  console.log("🔐 Asignando roles...\n");

  // 1. VALIDATOR_ROLE a ONG Ambiental (validator1)
  console.log("1️⃣  Asignando VALIDATOR_ROLE a ONG Ambiental...");
  const hasValidator1 = await ReciclaToken.hasRole(
    VALIDATOR_ROLE,
    validator1Wallet
  );
  if (!hasValidator1) {
    console.log(`   Otorgando a: ${validator1Wallet}`);
    const tx1 = await ReciclaToken.grantRole(VALIDATOR_ROLE, validator1Wallet);
    await tx1.wait();
    console.log(`   ✅ VALIDATOR_ROLE otorgado. TX: ${tx1.hash}`);
  } else {
    console.log("   ℹ️  Ya tiene VALIDATOR_ROLE");
  }
  console.log("");

  // 2. VALIDATOR_ROLE a ONG 2 (validator2)
  console.log("2️⃣  Asignando VALIDATOR_ROLE a ONG 2...");
  const hasValidator2 = await ReciclaToken.hasRole(
    VALIDATOR_ROLE,
    validator2Wallet
  );
  if (!hasValidator2) {
    console.log(`   Otorgando a: ${validator2Wallet}`);
    const tx2 = await ReciclaToken.grantRole(VALIDATOR_ROLE, validator2Wallet);
    await tx2.wait();
    console.log(`   ✅ VALIDATOR_ROLE otorgado. TX: ${tx2.hash}`);
  } else {
    console.log("   ℹ️  Ya tiene VALIDATOR_ROLE");
  }
  console.log("");

  // 3. WHITELIST_MANAGER_ROLE a Centro de Acopio
  console.log("3️⃣  Asignando WHITELIST_MANAGER_ROLE a Centro de Acopio...");
  const hasCentroWhitelist = await ReciclaToken.hasRole(
    WHITELIST_MANAGER_ROLE,
    centroWallet
  );
  if (!hasCentroWhitelist) {
    console.log(`   Otorgando a: ${centroWallet}`);
    const tx3 = await ReciclaToken.grantRole(
      WHITELIST_MANAGER_ROLE,
      centroWallet
    );
    await tx3.wait();
    console.log(`   ✅ WHITELIST_MANAGER_ROLE otorgado. TX: ${tx3.hash}`);
  } else {
    console.log("   ℹ️  Ya tiene WHITELIST_MANAGER_ROLE");
  }
  console.log("");

  // 4. PROPOSER_ROLE a Centro de Acopio (para registrar actividades)
  console.log("4️⃣  Asignando PROPOSER_ROLE a Centro de Acopio...");
  const hasCentroProposer = await ReciclaToken.hasRole(
    PROPOSER_ROLE,
    centroWallet
  );
  if (!hasCentroProposer) {
    console.log(`   Otorgando a: ${centroWallet}`);
    const tx4 = await ReciclaToken.grantRole(PROPOSER_ROLE, centroWallet);
    await tx4.wait();
    console.log(`   ✅ PROPOSER_ROLE otorgado. TX: ${tx4.hash}`);
  } else {
    console.log("   ℹ️  Ya tiene PROPOSER_ROLE");
  }
  console.log("");

  // ==================== VERIFICACIÓN FINAL ====================

  console.log("🔍 Verificación final de roles:\n");

  // Admin/Backend
  console.log("👤 Admin/Backend (" + adminWallet + "):");
  const adminRoles = [
    { name: "PROPOSER_ROLE", hash: PROPOSER_ROLE },
    { name: "BURNER_ROLE", hash: BURNER_ROLE },
    { name: "WHITELIST_MANAGER_ROLE", hash: WHITELIST_MANAGER_ROLE },
  ];
  for (const role of adminRoles) {
    const hasRole = await ReciclaToken.hasRole(role.hash, adminWallet);
    console.log(`   ${role.name}: ${hasRole ? "✅" : "❌"}`);
  }
  console.log("");

  // Validador 1
  console.log("👤 Validador 1 - ONG Ambiental (" + validator1Wallet + "):");
  const val1HasRole = await ReciclaToken.hasRole(
    VALIDATOR_ROLE,
    validator1Wallet
  );
  console.log(`   VALIDATOR_ROLE: ${val1HasRole ? "✅" : "❌"}`);
  console.log("");

  // Validador 2
  console.log("👤 Validador 2 - ONG 2 (" + validator2Wallet + "):");
  const val2HasRole = await ReciclaToken.hasRole(
    VALIDATOR_ROLE,
    validator2Wallet
  );
  console.log(`   VALIDATOR_ROLE: ${val2HasRole ? "✅" : "❌"}`);
  console.log("");

  // Centro de Acopio
  console.log("👤 Centro de Acopio (" + centroWallet + "):");
  const centroRoles = [
    { name: "PROPOSER_ROLE", hash: PROPOSER_ROLE },
    { name: "WHITELIST_MANAGER_ROLE", hash: WHITELIST_MANAGER_ROLE },
  ];
  for (const role of centroRoles) {
    const hasRole = await ReciclaToken.hasRole(role.hash, centroWallet);
    console.log(`   ${role.name}: ${hasRole ? "✅" : "❌"}`);
  }
  console.log("");

  console.log("━".repeat(60));
  console.log("✅ Configuración de roles completada!");
  console.log("━".repeat(60));
  console.log("");
  console.log("📌 SIGUIENTE PASO:");
  console.log("  1. Verifica que todas las wallets tengan SepoliaETH");
  console.log("     (necesario para firmar transacciones)");
  console.log("");
  console.log("  2. Reinicia el backend Spring Boot:");
  console.log("     cd recicla_upao_nube");
  console.log("     mvn spring-boot:run");
  console.log("");
  console.log(
    "  3. El backend ahora usará Sepolia Testnet con roles correctos!"
  );
  console.log("");
  console.log("💡 IMPORTANTE:");
  console.log("  - Admin/Backend: Propone y quema tokens");
  console.log("  - Validadores (ONGs): Aprueban/rechazan actividades");
  console.log("  - Centro Acopio: Registra estudiantes y actividades");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
