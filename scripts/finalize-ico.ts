import { getContracts, getSigners, formatMATIC, formatREC } from "./_config.js";

/**
 * Script para finalizar la ICO y retirar fondos
 */

async function main() {
  console.log("\n===========================================");
  console.log("      FINALIZACIÓN DE ICO - ReciclaUPAO");
  console.log("===========================================\n");

  const { ico } = getContracts();
  const { admin } = await getSigners();

  // Conectar ICO como admin
  const icoAsAdmin = ico.connect(admin);

  // Consultar estado actual
  const [isActive, icoFinalized, softCapReached, totalRaised, totalTokensSold] =
    await Promise.all([
      (ico as any).isICOActive(),
      (ico as any).icoFinalized(),
      (ico as any).softCapReached(),
      (ico as any).totalRaised(),
      (ico as any).totalTokensSold(),
    ]);

  console.log("Estado actual de la ICO:");
  console.log(`   Activa:             ${isActive ? "Sí" : "No"}`);
  console.log(`   Finalizada:         ${icoFinalized ? "Sí" : "No"}`);
  console.log(`   Soft cap alcanzado: ${softCapReached ? "Sí" : "No"}`);
  console.log(`   Total recaudado:  ${formatMATIC(totalRaised)} MATIC`);
  console.log(`   Tokens vendidos:  ${formatREC(totalTokensSold)} REC\n`);

  if (icoFinalized) {
    console.log("La ICO ya ha sido finalizada.\n");
    return;
  }

  if (isActive) {
    console.log(
      "La ICO todavía está activa. Asegúrate de que haya terminado.\n"
    );
    const proceed = true; // En producción, aquí preguntarías al usuario
    if (!proceed) return;
  }

  console.log("Finalizando ICO...");
  const tx = await (icoAsAdmin as any).finalizeICO();
  console.log(`   TX enviada: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`   Confirmada en bloque #${receipt.blockNumber}\n`);

  if (softCapReached) {
    console.log("Retirando fondos (soft cap alcanzado)...");

    const withdrawTx = await (icoAsAdmin as any).withdrawFunds();
    console.log(`   TX enviada: ${withdrawTx.hash}`);

    const withdrawReceipt = await withdrawTx.wait();
    console.log(
      `   Fondos retirados en bloque #${withdrawReceipt.blockNumber}\n`
    );

    console.log("Fondos transferidos al owner exitosamente.");
  } else {
    console.log(
      "Soft cap NO alcanzado. Los compradores pueden reclamar refund.\n"
    );
  }

  console.log("Retirando tokens no vendidos...");
  const withdrawTokensTx = await (icoAsAdmin as any).withdrawUnsoldTokens();
  console.log(`   TX enviada: ${withdrawTokensTx.hash}`);

  const withdrawTokensReceipt = await withdrawTokensTx.wait();
  console.log(
    `   Tokens no vendidos retirados en bloque #${withdrawTokensReceipt.blockNumber}\n`
  );

  console.log("===========================================");
  console.log("       ICO FINALIZADA EXITOSAMENTE");
  console.log("===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
