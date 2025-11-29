import { getContracts, getSigners, parseREC, formatREC } from "./_config.js";

/**
 * Script para simular registro de actividad de reciclaje y acuñación de tokens
 *
 * Uso:
 *   npx tsx scripts/recycle-activity.ts [cantidad_tokens] [usuario_numero]
 *
 * Ejemplo:
 *   npx tsx scripts/recycle-activity.ts 50 1
 */

const tokenAmount = process.argv[2] || "50"; // Por defecto 50 tokens
const userNumber = parseInt(process.argv[3] || "1"); // Por defecto usuario 1

async function main() {
  console.log("\n===========================================");
  console.log("    REGISTRO DE ACTIVIDAD DE RECICLAJE");
  console.log("===========================================\n");

  const { token } = getContracts();
  const { backend, user1, user2, user3 } = await getSigners();

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

  // Conectar token como backend (tiene MINTER_ROLE)
  const tokenAsBackend = token.connect(backend);

  const tokensToMint = parseREC(tokenAmount);
  const activityDescription = `Entrega de ${tokenAmount} kg de plástico reciclado`;

  console.log("Detalles de la actividad:");
  console.log(`   Tipo:        ${activityDescription}`);
  console.log(`   Recompensa:  ${tokenAmount} REC\n`);

  // Acuñar tokens
  console.log("Acuñando tokens...");
  const tx = await (tokenAsBackend as any).mintForActivity(
    userAddr,
    tokensToMint,
    activityDescription
  );
  console.log(`   TX enviada: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`   Confirmada en bloque #${receipt.blockNumber}\n`);

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
