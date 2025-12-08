import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Dirección del backend (Account #1 - SIEMPRE LA MISMA con mnemonic determinista)
  // Ver ACCOUNTS.md para más detalles
  const backendAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  // Cantidad a transferir: 100 ETH (suficiente para pruebas locales)
  const amount = ethers.parseEther("100");
  console.log("\n💰 Financiando wallet del backend...");
  console.log("━".repeat(60));
  console.log(`De:       ${deployer.address}`);
  console.log(`Para:     ${backendAddress}`);
  console.log(`Cantidad: 100 ETH`);
  console.log("━".repeat(60));

  // Verificar balance antes
  const balanceBefore = await ethers.provider.getBalance(backendAddress);
  console.log(`\n📊 Balance antes: ${ethers.formatEther(balanceBefore)} ETH`);

  // Transferir ETH
  const tx = await deployer.sendTransaction({
    to: backendAddress,
    value: amount,
  });

  console.log(`\n⏳ Esperando confirmación...`);
  await tx.wait();

  // Verificar balance después
  const balanceAfter = await ethers.provider.getBalance(backendAddress);
  console.log(`✅ Transferencia exitosa!`);
  console.log(`📊 Balance después: ${ethers.formatEther(balanceAfter)} ETH`);
  console.log(`TX: ${tx.hash}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
