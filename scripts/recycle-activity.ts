import { getContracts, getSigners, parseREC, formatREC } from "./_config.js";

/**
 * Script para simular registro de actividad de reciclaje con sistema de propuestas
 *
 * Uso:
 *   npx tsx scripts/recycle-activity.ts [peso_kg] [tipo_material] [usuario_numero]
 *
 * Ejemplo:
 *   npx tsx scripts/recycle-activity.ts 50 plastico 1
 *
 * Materiales disponibles: plastico, papel, vidrio, metal, carton, organico
 */

const pesoKg = parseInt(process.argv[2] || "50"); // Por defecto 50 kg
const tipoMaterial = process.argv[3] || "plastico"; // Por defecto plástico
const userNumber = parseInt(process.argv[4] || "1"); // Por defecto usuario 1

async function main() {
  console.log("\n===========================================");
  console.log("    REGISTRO DE ACTIVIDAD DE RECICLAJE");
  console.log("    (Sistema de Propuestas Multi-Firma)");
  console.log("===========================================\n");

  const { token } = getContracts();
  const { backend, validator1, validator2, user1, user2, user3 } =
    await getSigners();

  // Seleccionar usuario
  const users = [user1, user2, user3];
  const selectedUser = users[userNumber - 1];

  if (!selectedUser) {
    console.log("Usuario inválido. Usa 1, 2 o 3\n");
    return;
  }

  const userAddr = await selectedUser.getAddress();

  console.log(`Registrando actividad para: ${userAddr}\n`);

  // Verificar que esté en whitelist
  const isWhitelisted = await (token as any).isWhitelisted(userAddr);
  if (!isWhitelisted) {
    console.log(
      "Usuario no está en whitelist. Ejecuta primero: npm run setup\n"
    );
    return;
  }

  // Consultar balance antes
  const balanceBefore = await (token as any).balanceOf(userAddr);
  const totalEarnedBefore = await (token as any).totalTokensEarnedByUser(
    userAddr
  );

  console.log("Estado antes de la actividad:");
  console.log(`   Balance actual:     ${formatREC(balanceBefore)} REC`);
  console.log(
    `   Total ganado (histórico): ${formatREC(totalEarnedBefore)} REC\n`
  );

  // PASO 1: Backend propone la actividad
  const tokenAsBackend = token.connect(backend);
  const evidenciaIPFS = `QmTest${Date.now()}...${tipoMaterial}`;

  // Calcular tokens esperados
  const tokensCalculados = await (token as any).calcularTokens(
    pesoKg,
    tipoMaterial
  );

  console.log("📝 PASO 1: Backend propone actividad");
  console.log(`   Material:    ${tipoMaterial}`);
  console.log(`   Peso:        ${pesoKg} kg`);
  console.log(`   Tokens:      ${formatREC(tokensCalculados)} REC`);
  console.log(`   Evidencia:   ${evidenciaIPFS}\n`);

  const proposalTx = await (tokenAsBackend as any).proponerActividad(
    userAddr,
    pesoKg,
    tipoMaterial,
    evidenciaIPFS
  );
  console.log(`   TX enviada: ${proposalTx.hash}`);

  const proposalReceipt = await proposalTx.wait();
  console.log(`   Confirmada en bloque #${proposalReceipt.blockNumber}`);

  // Obtener ID de la actividad del evento
  const actividadCounter = await (token as any).actividadCounter();
  const actividadId = actividadCounter - 1n;
  console.log(`   Actividad ID: ${actividadId}\n`);

  // PASO 2: Validador 1 aprueba
  console.log("✅ PASO 2: Validador 1 (Admin Ambiental) aprueba");
  const tokenAsValidator1 = token.connect(validator1);
  const approve1Tx = await (tokenAsValidator1 as any).aprobarActividad(
    actividadId
  );
  console.log(`   TX enviada: ${approve1Tx.hash}`);

  const approve1Receipt = await approve1Tx.wait();
  console.log(`   Confirmada en bloque #${approve1Receipt.blockNumber}`);
  console.log(`   Aprobaciones: 1/2\n`);

  // PASO 3: Validador 2 aprueba (esto ejecutará el minting)
  console.log("✅ PASO 3: Validador 2 (Centro Acopio) aprueba");
  const tokenAsValidator2 = token.connect(validator2);
  const approve2Tx = await (tokenAsValidator2 as any).aprobarActividad(
    actividadId
  );
  console.log(`   TX enviada: ${approve2Tx.hash}`);

  const approve2Receipt = await approve2Tx.wait();
  console.log(`   Confirmada en bloque #${approve2Receipt.blockNumber}`);
  console.log(`   Aprobaciones: 2/2`);
  console.log(`   🎉 ¡Tokens acuñados automáticamente!\n`);

  // Consultar estado después
  const balanceAfter = await (token as any).balanceOf(userAddr);
  const totalEarnedAfter = await (token as any).totalTokensEarnedByUser(
    userAddr
  );
  const totalMinted = await (token as any).totalMinted();
  const remainingSupply = await (token as any).remainingSupply();

  console.log("Estado después de la actividad:");
  console.log(`   Nuevo balance:      ${formatREC(balanceAfter)} REC`);
  console.log(`   Total ganado:       ${formatREC(totalEarnedAfter)} REC`);
  console.log(
    `   Tokens recibidos:   ${formatREC(balanceAfter - balanceBefore)} REC\n`
  );

  console.log("Estado global del sistema:");
  console.log(`   Total acuñado:      ${formatREC(totalMinted)} REC`);
  console.log(`   Supply restante:    ${formatREC(remainingSupply)} REC\n`);

  console.log("===========================================");
  console.log("      ACTIVIDAD REGISTRADA");
  console.log("===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
