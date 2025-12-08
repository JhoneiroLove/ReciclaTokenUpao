import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n💰 Verificando balances de tokens REC...\n");

  // Obtener dirección del contrato desplegado
  const deploymentPath = path.join(
    __dirname,
    "..",
    "deployments",
    "localhost.json"
  );
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const tokenAddress = deployment.ReciclaToken;

  // Obtener ABI
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "ReciclaToken.sol",
    "ReciclaToken.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Conectar al contrato
  const [signer] = await ethers.getSigners();
  const token = new ethers.Contract(tokenAddress, artifact.abi, signer) as any;

  console.log(`📍 Contrato ReciclaToken: ${tokenAddress}\n`);

  // Obtener signers de Hardhat (primeras 10 cuentas)
  const signers = await ethers.getSigners();
  const cuentasNombres = [
    "Admin",
    "Backend",
    "ONG1 Validador",
    "ONG2 Validador",
    "Centro Acopio / Estudiante",
    "Estudiante 2",
    "Estudiante 3",
    "Estudiante 4",
    "Estudiante 5",
    "Estudiante 6",
  ];

  for (let i = 0; i < Math.min(10, signers.length); i++) {
    const cuenta = signers[i];
    const address = await cuenta.getAddress();
    const nombre = `${cuentasNombres[i]} (Account #${i})`;

    try {
      const balance = await token.balanceOf(address);
      const balanceFormatted = ethers.formatEther(balance);

      const isWhitelisted = await token.isWhitelisted(address);
      const whitelistStatus = isWhitelisted
        ? "✅ Whitelisted"
        : "❌ No whitelisted";

      console.log(`👤 ${nombre}`);
      console.log(`   📍 ${address}`);
      console.log(`   💎 Balance: ${balanceFormatted} REC`);
      console.log(`   ${whitelistStatus}\n`);
    } catch (error) {
      console.log(`❌ Error verificando ${nombre}: ${error}\n`);
    }
  }

  // Verificar supply total
  const totalSupply = await token.totalSupply();
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Total Supply: ${ethers.formatEther(totalSupply)} REC`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
