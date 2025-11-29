import { getContracts, formatREC, formatMATIC, provider } from "./_config.js";

/**
 * Script para mostrar información completa del token REC y la ICO
 */
async function main() {
  console.log("\n===========================================");
  console.log("   INFORMACIÓN DEL SISTEMA ReciclaUPAO");
  console.log("===========================================\n");

  const { token, ico, addresses } = getContracts();

  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();

  console.log("RED:");
  console.log(`   Chain ID:     ${network.chainId}`);
  console.log(`   Nombre:       ${network.name}`);
  console.log(`   Bloque:       #${blockNumber}\n`);

  console.log("CONTRATOS:");
  console.log(`   Token:        ${addresses.token}`);
  console.log(`   ICO:          ${addresses.ico}\n`);

  const [name, symbol, decimals, maxSupply, totalMinted, remaining] =
    await Promise.all([
      (token as any).name(),
      (token as any).symbol(),
      (token as any).decimals(),
      (token as any).MAX_SUPPLY(),
      (token as any).totalMinted(),
      (token as any).remainingSupply(),
    ]);

  console.log("TOKEN REC:");
  console.log(`   Nombre:           ${name}`);
  console.log(`   Símbolo:          ${symbol}`);
  console.log(`   Decimales:        ${decimals}`);
  console.log(`   Supply Máximo:    ${formatREC(maxSupply)} REC`);
  console.log(`   Total Acuñado:    ${formatREC(totalMinted)} REC`);
  console.log(`   Disponible:       ${formatREC(remaining)} REC\n`);

  const [
    tokenPrice,
    softCap,
    hardCap,
    minPurchase,
    maxPurchase,
    startTime,
    endTime,
    isActive,
    icoFinalized,
    softCapReached,
    totalRaised,
    totalTokensSold,
    currentDiscount,
  ] = await Promise.all([
    (ico as any).tokenPrice(),
    (ico as any).softCap(),
    (ico as any).hardCap(),
    (ico as any).minPurchase(),
    (ico as any).maxPurchase(),
    (ico as any).startTime(),
    (ico as any).endTime(),
    (ico as any).isICOActive(),
    (ico as any).icoFinalized(),
    (ico as any).softCapReached(),
    (ico as any).totalRaised(),
    (ico as any).totalTokensSold(),
    (ico as any).getCurrentDiscount(),
  ]);

  console.log("ICO:");
  console.log(`   Estado:           ${isActive ? "ACTIVA" : "INACTIVA"}`);
  console.log(`   Finalizada:       ${icoFinalized ? "Sí" : "No"}`);
  console.log(`   Soft Cap:         ${formatMATIC(softCap)} MATIC`);
  console.log(`   Hard Cap:         ${formatMATIC(hardCap)} MATIC`);
  console.log(`   Precio:           ${formatMATIC(tokenPrice)} MATIC/REC`);
  console.log(`   Descuento actual: ${currentDiscount}%`);
  console.log(`   Compra mínima:    ${formatREC(minPurchase)} REC`);
  console.log(`   Compra máxima:    ${formatREC(maxPurchase)} REC\n`);

  if (Number(startTime) > 0) {
    const start = new Date(Number(startTime) * 1000);
    const end = new Date(Number(endTime) * 1000);
    const timeRemaining = await (ico as any).getTimeRemaining();

    console.log("CRONOLOGÍA:");
    console.log(`   Inicio:           ${start.toLocaleString()}`);
    console.log(`   Fin:              ${end.toLocaleString()}`);

    if (Number(timeRemaining) > 0) {
      const days = Math.floor(Number(timeRemaining) / 86400);
      const hours = Math.floor((Number(timeRemaining) % 86400) / 3600);
      const mins = Math.floor((Number(timeRemaining) % 3600) / 60);
      console.log(`   Tiempo restante:  ${days}d ${hours}h ${mins}m`);
    }
    console.log();
  }

  console.log("PROGRESO:");
  console.log(`   Total recaudado:  ${formatMATIC(totalRaised)} MATIC`);
  console.log(`   Tokens vendidos:  ${formatREC(totalTokensSold)} REC`);
  console.log(`   Soft cap alcanzado: ${softCapReached ? "Sí" : "No"}`);

  const softCapProgress =
    Number(totalRaised) > 0
      ? ((Number(totalRaised) * 100) / Number(softCap)).toFixed(2)
      : "0";
  const hardCapProgress =
    Number(totalRaised) > 0
      ? ((Number(totalRaised) * 100) / Number(hardCap)).toFixed(2)
      : "0";

  console.log(`   Progreso soft cap: ${softCapProgress}%`);
  console.log(`   Progreso hard cap: ${hardCapProgress}%\n`);

  const icoTokenBalance = await (token as any).balanceOf(addresses.ico);
  console.log("BALANCE ICO:");
  console.log(`   Tokens disponibles: ${formatREC(icoTokenBalance)} REC\n`);

  console.log("===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
