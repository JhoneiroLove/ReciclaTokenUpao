import { getContracts, getSigners, formatREC } from "./_config";

/**
 * Script para consultar balances de todos los actores del sistema
 */
async function main() {
  console.log("\n===========================================");
  console.log("        BALANCES DEL SISTEMA ReciclaUPAO");
  console.log("===========================================\n");

  const { token, addresses } = getContracts();
  const { admin, backend, user1, user2, user3, user4 } = await getSigners();

  // Obtener direcciones
  const [adminAddr, backendAddr, user1Addr, user2Addr, user3Addr, user4Addr] =
    await Promise.all([
      admin.getAddress(),
      backend.getAddress(),
      user1.getAddress(),
      user2.getAddress(),
      user3.getAddress(),
      user4.getAddress(),
    ]);

  // Consultar balances
  const [
    adminBalance,
    backendBalance,
    user1Balance,
    user2Balance,
    user3Balance,
    user4Balance,
  ] = await Promise.all([
    (token as any).balanceOf(adminAddr),
    (token as any).balanceOf(backendAddr),
    (token as any).balanceOf(user1Addr),
    (token as any).balanceOf(user2Addr),
    (token as any).balanceOf(user3Addr),
    (token as any).balanceOf(user4Addr),
  ]);

  // Consultar información extendida de usuarios (si están en whitelist)
  const [user1Whitelisted, user2Whitelisted, user3Whitelisted] =
    await Promise.all([
      (token as any).isWhitelisted(user1Addr),
      (token as any).isWhitelisted(user2Addr),
      (token as any).isWhitelisted(user3Addr),
    ]);

  console.log("ADMINISTRACIÓN:");
  console.log(`   Admin:     ${adminAddr}`);
  console.log(`   Balance:   ${formatREC(adminBalance)} REC\n`);

  console.log(`   Backend:   ${backendAddr}`);
  console.log(`   Balance:   ${formatREC(backendBalance)} REC\n`);

  console.log("USUARIOS:");
  console.log(`   User #1:   ${user1Addr}`);
  console.log(`   Balance:   ${formatREC(user1Balance)} REC`);
  console.log(`   Whitelist: ${user1Whitelisted ? "Sí" : "No"}\n`);

  console.log(`   User #2:   ${user2Addr}`);
  console.log(`   Balance:   ${formatREC(user2Balance)} REC`);
  console.log(`   Whitelist: ${user2Whitelisted ? "Sí" : "No"}\n`);

  console.log(`   User #3:   ${user3Addr}`);
  console.log(`   Balance:   ${formatREC(user3Balance)} REC`);
  console.log(`   Whitelist: ${user3Whitelisted ? "Sí" : "No"}\n`);

  console.log(`   User #4:   ${user4Addr}`);
  console.log(`   Balance:   ${formatREC(user4Balance)} REC\n`);

  // Resumen total
  const totalSupply = await (token as any).totalSupply();
  const totalMinted = await (token as any).totalMinted();

  console.log("RESUMEN:");
  console.log(`   Total Supply:  ${formatREC(totalSupply)} REC`);
  console.log(`   Total Acuñado: ${formatREC(totalMinted)} REC\n`);

  console.log("===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
