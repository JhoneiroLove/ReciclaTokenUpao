import { expect } from "chai";
import { ethers } from "hardhat";
import { ReciclaToken, ReciclaICO } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ReciclaUPAO - Sistema Completo", function () {
  let reciclaToken: ReciclaToken;
  let reciclaICO: ReciclaICO;
  let admin: SignerWithAddress;
  let backend: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const TOKENS_FOR_ICO = ethers.parseEther("3000000"); // 3 millones
  const TOKEN_PRICE = ethers.parseEther("0.1"); // 0.1 MATIC por token
  const SOFT_CAP = ethers.parseEther("50000"); // 50,000 MATIC
  const HARD_CAP = ethers.parseEther("500000"); // 500,000 MATIC
  const MIN_PURCHASE = ethers.parseEther("100"); // 100 tokens
  const MAX_PURCHASE = ethers.parseEther("100000"); // 100,000 tokens

  beforeEach(async function () {
    // Obtener signers
    [admin, backend, user1, user2] = await ethers.getSigners();

    // Desplegar ReciclaToken
    const ReciclaTokenFactory = await ethers.getContractFactory("ReciclaToken");
    reciclaToken = await ReciclaTokenFactory.deploy(
      admin.address,
      backend.address
    );

    // Desplegar ReciclaICO
    const ReciclaICOFactory = await ethers.getContractFactory("ReciclaICO");
    reciclaICO = await ReciclaICOFactory.deploy(
      await reciclaToken.getAddress(),
      TOKEN_PRICE,
      SOFT_CAP,
      HARD_CAP,
      MIN_PURCHASE,
      MAX_PURCHASE
    );

    // Agregar admin a whitelist
    await reciclaToken
      .connect(backend)
      .addToWhitelist(admin.address, "DNI-ADMIN");

    // Acuñar tokens para la ICO
    await reciclaToken
      .connect(backend)
      .mintForActivity(admin.address, TOKENS_FOR_ICO, "Tokens para ICO");

    // Transferir tokens al contrato ICO
    await reciclaToken.transfer(await reciclaICO.getAddress(), TOKENS_FOR_ICO);

    // Agregar usuarios a whitelist
    await reciclaToken
      .connect(backend)
      .addMultipleToWhitelist(
        [user1.address, user2.address],
        ["DNI-USER1", "DNI-USER2"]
      );

    // Iniciar ICO (30 días)
    await reciclaICO.startICO(60 * 60 * 24 * 30);
  });

  describe("🔄 Flujo Completo de Usuario", function () {
    it("Debe permitir comprar tokens, reciclar, y canjear recompensas", async function () {
      // ==================== PASO 1: COMPRA EN ICO ====================
      console.log("\n   📝 PASO 1: Usuario compra tokens en la ICO");

      const maticToSend = ethers.parseEther("10"); // 10 MATIC

      // Calcular tokens esperados (con 15% de descuento)
      const tokensWithoutDiscount =
        (maticToSend * ethers.parseEther("1")) / TOKEN_PRICE;
      const bonusTokens = (tokensWithoutDiscount * 15n) / 100n;
      const expectedTokens = tokensWithoutDiscount + bonusTokens;

      // Realizar compra
      await reciclaICO.connect(user1).buyTokens({ value: maticToSend });

      // Verificar balance después de compra
      const balanceAfterPurchase = await reciclaToken.balanceOf(user1.address);
      expect(balanceAfterPurchase).to.equal(expectedTokens);

      console.log(
        `   ✅ Usuario compró ${ethers.formatEther(
          expectedTokens
        )} REC con descuento del 15%`
      );

      // ==================== PASO 2: ACTIVIDAD DE RECICLAJE ====================
      console.log("\n   ♻️  PASO 2: Usuario registra actividad de reciclaje");

      const recycleReward = ethers.parseEther("50"); // 50 tokens de recompensa

      // Backend registra la actividad y acuña tokens
      await reciclaToken
        .connect(backend)
        .mintForActivity(
          user1.address,
          recycleReward,
          "Reciclaje de 50kg de plástico"
        );

      // Verificar balance después de reciclar
      const balanceAfterRecycle = await reciclaToken.balanceOf(user1.address);
      expect(balanceAfterRecycle).to.equal(expectedTokens + recycleReward);

      // Verificar tracking de tokens ganados
      const totalEarned = await reciclaToken.totalTokensEarnedByUser(
        user1.address
      );
      expect(totalEarned).to.equal(recycleReward);

      console.log(
        `   ✅ Usuario ganó ${ethers.formatEther(
          recycleReward
        )} REC por reciclar`
      );

      // ==================== PASO 3: CANJE DE RECOMPENSA ====================
      console.log("\n   🎁 PASO 3: Usuario canjea recompensa");

      const redeemAmount = ethers.parseEther("25"); // 25 tokens

      // Backend procesa el canje y quema tokens
      await reciclaToken
        .connect(backend)
        .burnForRedemption(
          user1.address,
          redeemAmount,
          "Canje de mochila reciclada"
        );

      // Verificar balance final
      const finalBalance = await reciclaToken.balanceOf(user1.address);
      const expectedFinalBalance =
        expectedTokens + recycleReward - redeemAmount;
      expect(finalBalance).to.equal(expectedFinalBalance);

      // Verificar tracking de tokens gastados
      const totalSpent = await reciclaToken.totalTokensSpentByUser(
        user1.address
      );
      expect(totalSpent).to.equal(redeemAmount);

      console.log(
        `   ✅ Usuario canjeó ${ethers.formatEther(redeemAmount)} REC`
      );

      // ==================== VERIFICACIÓN FINAL ====================
      console.log("\n   📊 VERIFICACIÓN FINAL:");

      const [earned, spent, current] = await reciclaToken.getNetBalance(
        user1.address
      );

      console.log(
        `   💰 Tokens ganados por reciclar: ${ethers.formatEther(earned)} REC`
      );
      console.log(
        `   🔥 Tokens gastados en canjes: ${ethers.formatEther(spent)} REC`
      );
      console.log(`   💵 Balance actual: ${ethers.formatEther(current)} REC`);

      // Verificar que los números cuadran
      expect(earned).to.equal(recycleReward);
      expect(spent).to.equal(redeemAmount);
      expect(current).to.equal(expectedFinalBalance);

      // Verificar progreso de la ICO
      const totalRaised = await reciclaICO.totalRaised();
      const totalTokensSold = await reciclaICO.totalTokensSold();

      expect(totalRaised).to.equal(maticToSend);
      expect(totalTokensSold).to.equal(expectedTokens);

      console.log(
        `\n   🎯 ICO: ${ethers.formatEther(totalRaised)} MATIC recaudados`
      );
      console.log(
        `   🪙 ICO: ${ethers.formatEther(totalTokensSold)} REC vendidos`
      );

      // Verificar supply total
      const totalSupply = await reciclaToken.totalSupply();
      const expectedSupply = TOKENS_FOR_ICO + recycleReward - redeemAmount;
      expect(totalSupply).to.equal(expectedSupply);

      console.log(
        `   📈 Supply total: ${ethers.formatEther(totalSupply)} REC\n`
      );
    });
  });
});
