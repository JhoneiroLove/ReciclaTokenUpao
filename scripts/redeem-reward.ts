import { getContracts, getSigners, parseREC, formatREC } from "./_config.js";

/**
 * Script para simular canje de recompensa (quema de tokens)
 *
 * Uso:
 *   npx tsx scripts/redeem-reward.ts [cantidad_tokens] [usuario_numero]
 *
 * Ejemplo:
 *   npx tsx scripts/redeem-reward.ts 25 1
 */

const tokenAmount = process.argv[2] || "25"; // Por defecto 25 tokens
const userNumber = parseInt(process.argv[3] || "1"); // Por defecto usuario 1

async function main() {
  console.log("\n===========================================");
  console.log("       CANJE DE RECOMPENSA - ReciclaUPAO");
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

  console.log(`Procesando canje para: ${userAddr}\n`);

  // Consultar balance antes
  const balanceBefore = await (token as any).balanceOf(userAddr);
  const totalSpentBefore = await (token as any).totalTokensSpentByUser(
    userAddr
  );
  const totalEarned = await (token as any).totalTokensEarnedByUser(userAddr);

  console.log("Estado antes del canje:");
  console.log(`   Balance actual:     ${formatREC(balanceBefore)} REC`);
  console.log(`   Total ganado:       ${formatREC(totalEarned)} REC`);
  console.log(`   Total gastado:      ${formatREC(totalSpentBefore)} REC\n`);

  const tokensToBurn = parseREC(tokenAmount);

  // Verificar que tenga suficiente balance
  if (balanceBefore < tokensToBurn) {
    console.log(
      `Balance insuficiente. Solo tiene ${formatREC(balanceBefore)} REC\n`
    );
    return;
  }

  // Conectar token como backend (tiene BURNER_ROLE)
  const tokenAsBackend = token.connect(backend);

  const rewardDescription = `Canje de mochila reciclada - ${tokenAmount} REC`;

  console.log("Detalles del canje:");
  console.log(`   Recompensa:  ${rewardDescription}`);
  console.log(`   Costo:       ${tokenAmount} REC\n`);

  // Quemar tokens
  console.log("Quemando tokens...");
  const tx = await (tokenAsBackend as any).burnForRedemption(
    userAddr,
    tokensToBurn,
    rewardDescription
  );
  console.log(`   TX enviada: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`   Confirmada en bloque #${receipt.blockNumber}\n`);

  // Consultar estado después
  const balanceAfter = await (token as any).balanceOf(userAddr);
  const totalSpentAfter = await (token as any).totalTokensSpentByUser(userAddr);
  const totalSupply = await (token as any).totalSupply();

  console.log("Estado después del canje:");
  console.log(`   Nuevo balance:      ${formatREC(balanceAfter)} REC`);
  console.log(`   Total gastado:      ${formatREC(totalSpentAfter)} REC`);
  console.log(
    `   Tokens quemados:    ${formatREC(balanceBefore - balanceAfter)} REC\n`
  );

  console.log("Estado global del sistema:");
  console.log(`   Total Supply:       ${formatREC(totalSupply)} REC\n`);

  console.log("===========================================");
  console.log("        CANJE EXITOSO");
  console.log("===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
