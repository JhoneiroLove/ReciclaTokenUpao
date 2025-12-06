import { getContracts, formatREC, formatMATIC } from "./_config.js";

/**
 * Script para consultar eventos históricos del sistema de propuestas
 *
 * Uso:
 *   npx tsx scripts/events-history.ts [fromBlock] [toBlock]
 *
 * Ejemplo:
 *   npx tsx scripts/events-history.ts 0 latest
 */

const fromBlock = process.argv[2] || "0";
const toBlock = process.argv[3] || "latest";

async function main() {
  console.log("\n===========================================");
  console.log("   HISTORIAL DE EVENTOS - ReciclaUPAO");
  console.log("   (Sistema de Propuestas Multi-Firma)");
  console.log("===========================================\n");
  console.log(`Rango de bloques: ${fromBlock} → ${toBlock}\n`);

  const { token } = getContracts();

  // ========== EVENTOS DEL SISTEMA DE PROPUESTAS ==========

  console.log("📋 EVENTOS DE PROPUESTAS:\n");

  // ActividadPropuesta
  const propuestaFilter = (token as any).filters.ActividadPropuesta();
  const propuestaEvents = await (token as any).queryFilter(
    propuestaFilter,
    fromBlock,
    toBlock
  );

  console.log(`ActividadPropuesta (${propuestaEvents.length} eventos):`);
  for (const event of propuestaEvents) {
    const args = event.args as any;
    console.log(`   📝 Propuesta #${args.actividadId}`);
    console.log(`      Bloque:    #${event.blockNumber}`);
    console.log(`      Usuario:   ${args.usuario}`);
    console.log(`      Material:  ${args.tipoMaterial}`);
    console.log(`      Peso:      ${args.pesoKg} kg`);
    console.log(`      Tokens:    ${formatREC(args.tokensCalculados)} REC`);
    console.log(`      Evidencia: ${args.evidenciaIPFS}`);
    console.log(`      TX:        ${event.transactionHash}\n`);
  }

  // ActividadAprobada
  const aprobadaFilter = (token as any).filters.ActividadAprobada();
  const aprobadaEvents = await (token as any).queryFilter(
    aprobadaFilter,
    fromBlock,
    toBlock
  );

  console.log(`ActividadAprobada (${aprobadaEvents.length} eventos):`);
  for (const event of aprobadaEvents) {
    const args = event.args as any;
    console.log(`   ✅ Aprobación #${args.actividadId}`);
    console.log(`      Bloque:       #${event.blockNumber}`);
    console.log(`      Validador:    ${args.validador}`);
    console.log(`      Aprobaciones: ${args.aprobacionesTotales}/2`);
    console.log(`      TX:           ${event.transactionHash}\n`);
  }

  // ActividadRechazada
  const rechazadaFilter = (token as any).filters.ActividadRechazada();
  const rechazadaEvents = await (token as any).queryFilter(
    rechazadaFilter,
    fromBlock,
    toBlock
  );

  console.log(`ActividadRechazada (${rechazadaEvents.length} eventos):`);
  for (const event of rechazadaEvents) {
    const args = event.args as any;
    console.log(`   ❌ Rechazo #${args.actividadId}`);
    console.log(`      Bloque:    #${event.blockNumber}`);
    console.log(`      Validador: ${args.validador}`);
    console.log(`      Razón:     ${args.razon}`);
    console.log(`      TX:        ${event.transactionHash}\n`);
  }

  // ActividadEjecutada
  const ejecutadaFilter = (token as any).filters.ActividadEjecutada();
  const ejecutadaEvents = await (token as any).queryFilter(
    ejecutadaFilter,
    fromBlock,
    toBlock
  );

  console.log(`ActividadEjecutada (${ejecutadaEvents.length} eventos):`);
  for (const event of ejecutadaEvents) {
    const args = event.args as any;
    console.log(`   🎉 Ejecución #${args.actividadId}`);
    console.log(`      Bloque:  #${event.blockNumber}`);
    console.log(`      Usuario: ${args.usuario}`);
    console.log(`      Tokens:  ${formatREC(args.tokensAcunados)} REC`);
    console.log(`      TX:      ${event.transactionHash}\n`);
  }

  // RateMaterialActualizado
  const rateFilter = (token as any).filters.RateMaterialActualizado();
  const rateEvents = await (token as any).queryFilter(
    rateFilter,
    fromBlock,
    toBlock
  );

  console.log(`RateMaterialActualizado (${rateEvents.length} eventos):`);
  for (const event of rateEvents) {
    const args = event.args as any;
    console.log(`   ⚙️  Material: ${args.tipoMaterial}`);
    console.log(`      Nuevo Rate: ${formatREC(args.nuevoRate)} REC/kg`);
    console.log(`      TX:         ${event.transactionHash}\n`);
  }

  // ========== EVENTOS DE TOKENS ==========

  console.log("\n💰 EVENTOS DEL TOKEN:\n");

  // TokensMinted
  const mintedFilter = (token as any).filters.TokensMinted();
  const mintedEvents = await (token as any).queryFilter(
    mintedFilter,
    fromBlock,
    toBlock
  );

  console.log(`TokensMinted (${mintedEvents.length} eventos):`);
  for (const event of mintedEvents) {
    const args = event.args as any;
    console.log(`   Bloque #${event.blockNumber}`);
    console.log(`   Para:     ${args.to}`);
    console.log(`   Cantidad: ${formatREC(args.amount)} REC`);
    console.log(`   Razón:    ${args.reason}`);
    console.log(`   TX:       ${event.transactionHash}\n`);
  }

  // TokensBurned
  const burnedFilter = (token as any).filters.TokensBurned();
  const burnedEvents = await (token as any).queryFilter(
    burnedFilter,
    fromBlock,
    toBlock
  );

  console.log(`🔥 TokensBurned (${burnedEvents.length} eventos):`);
  for (const event of burnedEvents) {
    const args = event.args as any;
    console.log(`   Bloque #${event.blockNumber}`);
    console.log(`   De:       ${args.from}`);
    console.log(`   Cantidad: ${formatREC(args.amount)} REC`);
    console.log(`   Razón:    ${args.reason}`);
    console.log(`   TX:       ${event.transactionHash}\n`);
  }

  // Transfers (excluyendo mint/burn)
  const transferFilter = (token as any).filters.Transfer();
  const transferEvents = await (token as any).queryFilter(
    transferFilter,
    fromBlock,
    toBlock
  );

  const regularTransfers = transferEvents.filter((e: any) => {
    return (
      e.args.from !== "0x0000000000000000000000000000000000000000" &&
      e.args.to !== "0x0000000000000000000000000000000000000000"
    );
  });

  console.log(`↔️  Transfers regulares (${regularTransfers.length} eventos):`);
  for (const event of regularTransfers) {
    const args = event.args as any;
    console.log(`   Bloque #${event.blockNumber}`);
    console.log(`   De:       ${args.from}`);
    console.log(`   Para:     ${args.to}`);
    console.log(`   Cantidad: ${formatREC(args.value)} REC`);
    console.log(`   TX:       ${event.transactionHash}\n`);
  }

  // ========== EVENTOS ADMINISTRATIVOS ==========

  console.log("\n👥 EVENTOS ADMINISTRATIVOS:\n");

  // UserWhitelisted
  const whitelistedFilter = (token as any).filters.UserWhitelisted();
  const whitelistedEvents = await (token as any).queryFilter(
    whitelistedFilter,
    fromBlock,
    toBlock
  );

  console.log(`UserWhitelisted (${whitelistedEvents.length} eventos):`);
  for (const event of whitelistedEvents) {
    const args = event.args as any;
    console.log(`   Usuario:  ${args.user}`);
    console.log(`   DNI Hash: ${args.dniHash}`);
    console.log(`   TX:       ${event.transactionHash}\n`);
  }

  // ========== RESUMEN ==========

  console.log("\n📊 RESUMEN:");
  console.log(`   Propuestas creadas:    ${propuestaEvents.length}`);
  console.log(`   Aprobaciones totales:  ${aprobadaEvents.length}`);
  console.log(`   Rechazos totales:      ${rechazadaEvents.length}`);
  console.log(`   Actividades ejecutadas: ${ejecutadaEvents.length}`);
  console.log(`   Tokens acuñados:       ${ejecutadaEvents.length} eventos`);
  console.log(`   Tokens quemados:       ${burnedEvents.length} eventos`);
  console.log(`   Transfers:             ${regularTransfers.length} eventos`);
  console.log(`   Usuarios whitelisted:  ${whitelistedEvents.length} eventos`);

  console.log("\n===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
