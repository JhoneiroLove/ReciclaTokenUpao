import { getContracts, formatREC, formatMATIC } from "./_config.js";

/**
 * Script para monitorear eventos del sistema de propuestas en tiempo real
 * Presiona Ctrl+C para detener
 */

async function main() {
  console.log("\n===========================================");
  console.log("   MONITOR DE EVENTOS - ReciclaUPAO");
  console.log("   (Sistema de Propuestas Multi-Firma)");
  console.log("===========================================\n");
  console.log("Escuchando eventos... (Ctrl+C para salir)\n");

  const { token } = getContracts();

  // ========== EVENTOS DEL SISTEMA DE PROPUESTAS ==========

  // Evento: ActividadPropuesta
  (token as any).on(
    "ActividadPropuesta",
    (
      actividadId: bigint,
      usuario: string,
      pesoKg: bigint,
      tipoMaterial: string,
      tokensCalculados: bigint,
      evidenciaIPFS: string,
      event: any
    ) => {
      console.log("📝 [ActividadPropuesta]");
      console.log(`   ID:        #${actividadId}`);
      console.log(`   Usuario:   ${usuario}`);
      console.log(`   Material:  ${tipoMaterial}`);
      console.log(`   Peso:      ${pesoKg} kg`);
      console.log(`   Tokens:    ${formatREC(tokensCalculados)} REC`);
      console.log(`   Evidencia: ${evidenciaIPFS}`);
      console.log(`   TX:        ${event.log.transactionHash}`);
      console.log(`   Bloque:    #${event.log.blockNumber}`);
      console.log(`   Estado:    ⏳ Pendiente aprobación (0/2)\n`);
    }
  );

  // Evento: ActividadAprobada
  (token as any).on(
    "ActividadAprobada",
    (
      actividadId: bigint,
      validador: string,
      aprobacionesTotales: number,
      event: any
    ) => {
      console.log("✅ [ActividadAprobada]");
      console.log(`   ID:          #${actividadId}`);
      console.log(`   Validador:   ${validador}`);
      console.log(`   Aprobaciones: ${aprobacionesTotales}/2`);
      console.log(`   TX:          ${event.log.transactionHash}`);
      console.log(`   Bloque:      #${event.log.blockNumber}`);
      if (aprobacionesTotales >= 2) {
        console.log(
          `   🎉 ¡Umbral alcanzado! Tokens acuñados automáticamente\n`
        );
      } else {
        console.log(
          `   ⏳ Esperando ${2 - aprobacionesTotales} aprobación(es) más\n`
        );
      }
    }
  );

  // Evento: ActividadRechazada
  (token as any).on(
    "ActividadRechazada",
    (actividadId: bigint, validador: string, razon: string, event: any) => {
      console.log("❌ [ActividadRechazada]");
      console.log(`   ID:        #${actividadId}`);
      console.log(`   Validador: ${validador}`);
      console.log(`   Razón:     ${razon}`);
      console.log(`   TX:        ${event.log.transactionHash}`);
      console.log(`   Bloque:    #${event.log.blockNumber}\n`);
    }
  );

  // Evento: ActividadEjecutada
  (token as any).on(
    "ActividadEjecutada",
    (
      actividadId: bigint,
      usuario: string,
      tokensAcunados: bigint,
      event: any
    ) => {
      console.log("🎉 [ActividadEjecutada]");
      console.log(`   ID:      #${actividadId}`);
      console.log(`   Usuario: ${usuario}`);
      console.log(`   Tokens:  ${formatREC(tokensAcunados)} REC`);
      console.log(`   TX:      ${event.log.transactionHash}`);
      console.log(`   Bloque:  #${event.log.blockNumber}\n`);
    }
  );

  // Evento: RateMaterialActualizado
  (token as any).on(
    "RateMaterialActualizado",
    (tipoMaterial: string, nuevoRate: bigint, event: any) => {
      console.log("⚙️  [RateMaterialActualizado]");
      console.log(`   Material:    ${tipoMaterial}`);
      console.log(`   Nuevo Rate:  ${formatREC(nuevoRate)} REC/kg`);
      console.log(`   TX:          ${event.log.transactionHash}`);
      console.log(`   Bloque:      #${event.log.blockNumber}\n`);
    }
  );

  // ========== EVENTOS DE TOKENS ==========

  // Evento: TokensMinted
  (token as any).on(
    "TokensMinted",
    (to: string, amount: bigint, reason: string, event: any) => {
      console.log("💰 [TokensMinted]");
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
