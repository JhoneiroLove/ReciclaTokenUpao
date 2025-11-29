import { getContracts, formatREC, formatMATIC } from "./_config.js";

/**
 * Script para monitorear eventos en tiempo real
 * Presiona Ctrl+C para detener
 */

async function main() {
  console.log("\n===========================================");
  console.log("   MONITOR DE EVENTOS - ReciclaUPAO");
  console.log("===========================================\n");
  console.log("Escuchando eventos... (Ctrl+C para salir)\n");

  const { token, ico } = getContracts();

  // Evento: TokensMinted
  (token as any).on(
    "TokensMinted",
    (to: string, amount: bigint, reason: string, event: any) => {
      console.log("[TokensMinted]");
      console.log(`   Para:     ${to}`);
      console.log(`   Cantidad: ${formatREC(amount)} REC`);
      console.log(`   Razón:    ${reason}`);
      console.log(`   TX:       ${event.log.transactionHash}`);
      console.log(`   Bloque:   #${event.log.blockNumber}\n`);
    }
  );

  // Evento: TokensBurned
  (token as any).on(
    "TokensBurned",
    (from: string, amount: bigint, reason: string, event: any) => {
      console.log("[TokensBurned]");
      console.log(`   De:       ${from}`);
      console.log(`   Cantidad: ${formatREC(amount)} REC`);
      console.log(`   Razón:    ${reason}`);
      console.log(`   TX:       ${event.log.transactionHash}`);
      console.log(`   Bloque:   #${event.log.blockNumber}\n`);
    }
  );

  // Evento: Transfer
  (token as any).on(
    "Transfer",
    (from: string, to: string, value: bigint, event: any) => {
      // Solo mostrar transfers que no sean mint/burn
      if (
        from !== "0x0000000000000000000000000000000000000000" &&
        to !== "0x0000000000000000000000000000000000000000"
      ) {
        console.log("[Transfer]");
        console.log(`   De:       ${from}`);
        console.log(`   Para:     ${to}`);
        console.log(`   Cantidad: ${formatREC(value)} REC`);
        console.log(`   TX:       ${event.log.transactionHash}`);
        console.log(`   Bloque:   #${event.log.blockNumber}\n`);
      }
    }
  );

  // Evento: UserWhitelisted
  (token as any).on(
    "UserWhitelisted",
    (user: string, dniHash: string, event: any) => {
      console.log("[UserWhitelisted]");
      console.log(`   Usuario:  ${user}`);
      console.log(`   DNI Hash: ${dniHash}`);
      console.log(`   TX:       ${event.log.transactionHash}\n`);
    }
  );

  // Evento: TokensPurchased
  (ico as any).on(
    "TokensPurchased",
    (
      buyer: string,
      maticAmount: bigint,
      tokenAmount: bigint,
      discountApplied: bigint,
      event: any
    ) => {
      console.log("[TokensPurchased]");
      console.log(`   Comprador: ${buyer}`);
      console.log(`   MATIC:     ${formatMATIC(maticAmount)} MATIC`);
      console.log(`   Tokens:    ${formatREC(tokenAmount)} REC`);
      console.log(`   Descuento: ${discountApplied}%`);
      console.log(`   TX:        ${event.log.transactionHash}`);
      console.log(`   Bloque:    #${event.log.blockNumber}\n`);
    }
  );

  // Evento: ICOStarted
  (ico as any).on(
    "ICOStarted",
    (startTime: bigint, endTime: bigint, event: any) => {
      console.log("[ICOStarted]");
      console.log(
        `   Inicio:  ${new Date(Number(startTime) * 1000).toLocaleString()}`
      );
      console.log(
        `   Fin:     ${new Date(Number(endTime) * 1000).toLocaleString()}`
      );
      console.log(`   TX:      ${event.log.transactionHash}\n`);
    }
  );

  // Evento: ICOFinalized
  (ico as any).on(
    "ICOFinalized",
    (
      totalRaised: bigint,
      totalTokensSold: bigint,
      softCapReached: boolean,
      event: any
    ) => {
      console.log("[ICOFinalized]");
      console.log(`   Total recaudado:    ${formatMATIC(totalRaised)} MATIC`);
      console.log(`   Tokens vendidos:    ${formatREC(totalTokensSold)} REC`);
      console.log(`   Soft cap alcanzado: ${softCapReached ? "Sí" : "No"}`);
      console.log(`   TX:                 ${event.log.transactionHash}\n`);
    }
  );

  process.on("SIGINT", () => {
    console.log("\n\nDeteniendo monitor de eventos...\n");
    process.exit(0);
  });

  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
