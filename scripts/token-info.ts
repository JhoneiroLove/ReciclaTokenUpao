import { getContracts, formatREC, provider } from "./_config.js";

/**
 * Script para mostrar información completa del token REC
 */
async function main() {
  console.log("\n===========================================");
  console.log("   INFORMACIÓN DEL SISTEMA ReciclaUPAO");
  console.log("===========================================\n");

  const { token, addresses } = getContracts();

  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();

  console.log("RED:");
  console.log(`   Chain ID:     ${network.chainId}`);
  console.log(`   Nombre:       ${network.name}`);
  console.log(`   Bloque:       #${blockNumber}\n`);

  console.log("CONTRATO:");
  console.log(`   Token:        ${addresses.token}\n`);

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

  console.log("===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
