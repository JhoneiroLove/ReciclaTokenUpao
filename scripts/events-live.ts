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

  const { token } = getContracts();

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
