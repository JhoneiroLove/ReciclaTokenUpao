import { getContracts, formatREC, formatMATIC } from "./_config.js";

/**
 * Script para consultar eventos históricos de los contratos
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
  console.log("===========================================\n");
  console.log(`Rango de bloques: ${fromBlock} → ${toBlock}\n`);

  const { token } = getContracts();

  console.log("EVENTOS DEL TOKEN:\n");

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

  console.log(`TokensBurned (${burnedEvents.length} eventos):`);
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

  console.log(`Transfers regulares (${regularTransfers.length} eventos):`);
  for (const event of regularTransfers) {
    const args = event.args as any;
    console.log(`   Bloque #${event.blockNumber}`);
    console.log(`   De:       ${args.from}`);
    console.log(`   Para:     ${args.to}`);
    console.log(`   Cantidad: ${formatREC(args.value)} REC`);
    console.log(`   TX:       ${event.transactionHash}\n`);
  }

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

  console.log("===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
