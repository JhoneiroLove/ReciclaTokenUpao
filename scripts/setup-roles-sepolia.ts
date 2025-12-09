import { ethers } from "hardhat";

/**
 * Script para configurar roles en ReciclaToken desplegado en Sepolia
 *
 * Ejecutar: npx hardhat run scripts/setup-roles-sepolia.ts --network sepolia
 */

async function main() {
  console.log("🔧 Configurando roles en ReciclaToken (Sepolia)...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Ejecutando con cuenta:", deployer.address);
  console.log("");

  // Dirección del contrato desplegado
  const tokenAddress = "0x6Ee68256eF29096e8Bc66c14494E5f58650488DD";

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

  // Wallet del deployer (ya tiene PROPOSER, BURNER, WHITELIST_MANAGER desde el constructor)
  const adminWallet = deployer.address;

  console.log("✅ Roles ya configurados en el constructor:");
  console.log("  Admin:", adminWallet, "→ DEFAULT_ADMIN_ROLE, PAUSER_ROLE");
  console.log(
    "  Backend:",
    adminWallet,
    "→ PROPOSER_ROLE, BURNER_ROLE, WHITELIST_MANAGER_ROLE"
  );
  console.log("");

  // Otorgar VALIDATOR_ROLE al mismo deployer (para pruebas)
  // En producción, estas serían wallets diferentes de las ONGs
  console.log("🔐 Otorgando VALIDATOR_ROLE...");

  const hasValidatorRole = await ReciclaToken.hasRole(
    VALIDATOR_ROLE,
    adminWallet
  );
  if (!hasValidatorRole) {
    console.log("  Otorgando VALIDATOR_ROLE a:", adminWallet);
    const tx = await ReciclaToken.grantRole(VALIDATOR_ROLE, adminWallet);
    await tx.wait();
    console.log("  ✅ VALIDATOR_ROLE otorgado. TX:", tx.hash);
  } else {
    console.log("  ℹ️  Ya tiene VALIDATOR_ROLE");
  }

  console.log("");

  // Verificar todos los roles
  console.log("🔍 Verificación final de roles:");
  const roles = [
    { name: "VALIDATOR_ROLE", hash: VALIDATOR_ROLE },
    { name: "PROPOSER_ROLE", hash: PROPOSER_ROLE },
    { name: "BURNER_ROLE", hash: BURNER_ROLE },
    { name: "WHITELIST_MANAGER_ROLE", hash: WHITELIST_MANAGER_ROLE },
  ];

  for (const role of roles) {
    const hasRole = await ReciclaToken.hasRole(role.hash, adminWallet);
    console.log(`  ${role.name}: ${hasRole ? "✅" : "❌"}`);
  }

  console.log("");
  console.log("✅ Configuración de roles completada!");
  console.log("");
  console.log("📌 SIGUIENTE PASO:");
  console.log("  Reinicia el backend Spring Boot:");
  console.log("  cd recicla_upao_nube");
  console.log("  mvn spring-boot:run");
  console.log("");
  console.log("  El backend ahora usará Sepolia Testnet!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
