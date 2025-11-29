import {
  getContracts,
  getSigners,
  parseMATIC,
  formatREC,
  formatMATIC,
} from "./_config.js";

/**
 * Script para simular compra de tokens REC en la ICO
 *
 * Uso:
 *   npx tsx scripts/buy-tokens.ts [cantidad_matic]
 *
 * Ejemplo:
 *   npx tsx scripts/buy-tokens.ts 10
 */

const maticAmount = process.argv[2] || "10"; // Por defecto 10 MATIC

async function main() {
  console.log("\n===========================================");
  console.log("       COMPRA DE TOKENS REC - ICO");
  console.log("===========================================\n");

  const { token, ico, addresses } = getContracts();
  const { user1 } = await getSigners();
  const user1Addr = await user1.getAddress();

  // Conectar ICO con el usuario
  const icoAsUser = ico.connect(user1);

  console.log(`Comprando tokens como: ${user1Addr}\n`);

  // Consultar estado antes de comprar
  const balanceBefore = await (token as any).balanceOf(user1Addr);
  const isActive = await (ico as any).isICOActive();
  const currentDiscount = await (ico as any).getCurrentDiscount();

  console.log("Estado antes de la compra:");
  console.log(`   Balance actual:    ${formatREC(balanceBefore)} REC`);
  console.log(`   ICO activa:        ${isActive ? "Sí" : "No"}`);
  console.log(`   Descuento actual:  ${currentDiscount}%\n`);

  if (!isActive) {
    console.log("La ICO no está activa. Ejecuta primero: npm run setup\n");
    return;
  }

  // Calcular cuántos tokens se recibirán
  const maticValue = parseMATIC(maticAmount);
  const calculation = await (ico as any).calculateTokenAmount(maticValue);
  const tokensWithoutDiscount = calculation[0];
  const bonusTokens = calculation[1];
  const totalTokens = calculation[2];

  console.log("Detalles de la compra:");
  console.log(`   MATIC a enviar:       ${formatMATIC(maticValue)} MATIC`);
  console.log(
    `   Tokens sin descuento: ${formatREC(tokensWithoutDiscount)} REC`
  );
  console.log(
    `   Bonus (${currentDiscount}%):          ${formatREC(bonusTokens)} REC`
  );
  console.log(`   Total a recibir:      ${formatREC(totalTokens)} REC\n`);

  // Ejecutar la compra
  console.log("Ejecutando compra...");
  const tx = await (icoAsUser as any).buyTokens({ value: maticValue });
  console.log(`   TX enviada: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`   Confirmada en bloque #${receipt.blockNumber}\n`);

  // Consultar estado después de la compra
  const balanceAfter = await (token as any).balanceOf(user1Addr);
  const totalRaised = await (ico as any).totalRaised();
  const totalTokensSold = await (ico as any).totalTokensSold();
  const progress = await (ico as any).getICOProgress();

  console.log("Estado después de la compra:");
  console.log(`   Nuevo balance:      ${formatREC(balanceAfter)} REC`);
  console.log(
    `   Tokens recibidos:   ${formatREC(balanceAfter - balanceBefore)} REC\n`
  );

  console.log("Progreso de la ICO:");
  console.log(`   Total recaudado:    ${formatMATIC(totalRaised)} MATIC`);
  console.log(`   Tokens vendidos:    ${formatREC(totalTokensSold)} REC`);
  console.log(`   Contribuyentes:     ${progress._contributorsCount}\n`);

  console.log("===========================================");
  console.log("           COMPRA EXITOSA");
  console.log("===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
