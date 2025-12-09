import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Script para desplegar ReciclaToken en Sepolia Testnet
 *
 * Requisitos:
 * 1. Tener SEPOLIA_RPC_URL configurado en .env
 * 2. Tener PRIVATE_KEY configurado en .env (cuenta con SepoliaETH)
 * 3. Ejecutar: npx hardhat run scripts/deploy-sepolia.ts --network sepolia
 */

async function main() {
  console.log("🚀 Desplegando ReciclaToken en Sepolia Testnet...\n");

  const [deployer] = await ethers.getSigners();

  console.log("📝 Información del deploy:");
  console.log("  Deployer:", deployer.address);
  console.log(
    "  Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );
  console.log("  Network:", (await ethers.provider.getNetwork()).name);
  console.log("  Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("");

  // Verificar balance
  const balance = await ethers.provider.getBalance(deployer.address);
  if (balance === 0n) {
    throw new Error(
      "❌ La cuenta no tiene SepoliaETH. Obtén SepoliaETH en: https://sepoliafaucet.com/"
    );
  }

  // Desplegar ReciclaToken
  console.log("📦 Desplegando ReciclaToken...");

  // Parámetros del constructor:
  // - admin: quien despliega será el admin inicial
  // - backendWallet: tendrá rol PROPOSER_ROLE, BURNER_ROLE, WHITELIST_MANAGER_ROLE
  const adminAddress = deployer.address;
  const backendWalletAddress = deployer.address; // Por ahora usa el mismo, luego se puede transferir

  console.log("  Admin:", adminAddress);
  console.log("  Backend Wallet:", backendWalletAddress);
  console.log("");

  const ReciclaToken = await ethers.getContractFactory("ReciclaToken");
  const token = await ReciclaToken.deploy(adminAddress, backendWalletAddress);

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("✅ ReciclaToken desplegado en:", tokenAddress);
  console.log("");

  // Verificar deployment
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();

  console.log("📋 Información del token:");
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Decimals:", decimals.toString());
  console.log("  Address:", tokenAddress);
  console.log("");

  // Guardar deployment info
  const deploymentPath = path.join(
    __dirname,
    "..",
    "deployments",
    "sepolia.json"
  );
  const deploymentData = {
    ReciclaToken: tokenAddress,
    deployer: deployer.address,
    network: "sepolia",
    chainId: 11155111,
    timestamp: new Date().toISOString(),
    txHash: token.deploymentTransaction()?.hash,
  };

  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));

  console.log("💾 Deployment info guardada en: deployments/sepolia.json");
  console.log("");

  // Instrucciones post-deploy
  console.log("📌 SIGUIENTE PASOS:");
  console.log("");
  console.log("1. Actualiza application.properties del backend:");
  console.log(`   blockchain.network=sepolia`);
  console.log(`   blockchain.rpc-url=https://rpc.sepolia.org`);
  console.log(`   blockchain.chain-id=11155111`);
  console.log(`   blockchain.token-address=${tokenAddress}`);
  console.log("");
  console.log(
    "2. Configura las wallets de los validadores (ONGs) en application.properties"
  );
  console.log("");
  console.log("3. Ejecuta el script de configuración inicial:");
  console.log("   npx hardhat run scripts/setup-initial.ts --network sepolia");
  console.log("");
  console.log("4. Verifica el contrato en Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${tokenAddress}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
