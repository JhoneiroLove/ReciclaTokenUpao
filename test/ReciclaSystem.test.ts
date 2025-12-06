import { expect } from "chai";
import { ethers } from "hardhat";
import { ReciclaToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ReciclaUPAO - Sistema de Incentivos Tokenizado", function () {
  let reciclaToken: ReciclaToken;
  let admin: SignerWithAddress;
  let backend: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    // Obtener signers
    [admin, backend, user1, user2] = await ethers.getSigners();

    // Desplegar ReciclaToken
    const ReciclaTokenFactory = await ethers.getContractFactory("ReciclaToken");
    reciclaToken = await ReciclaTokenFactory.deploy(
      admin.address,
      backend.address
    );

    // Agregar usuarios a whitelist
    await reciclaToken
      .connect(backend)
      .addMultipleToWhitelist(
        [user1.address, user2.address],
        ["DNI-USER1", "DNI-USER2"]
      );
  });

  describe("🔄 Flujo Completo de Usuario", function () {
    it("Debe permitir reciclar y canjear recompensas", async function () {
      // ==================== PASO 1: ACTIVIDAD DE RECICLAJE ====================
      console.log("\n   ♻️  PASO 1: Usuario registra actividad de reciclaje");

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
      expect(balanceAfterRecycle).to.equal(recycleReward);

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

      // ==================== PASO 2: SEGUNDA ACTIVIDAD DE RECICLAJE ====================
      console.log(
        "\n   ♻️  PASO 2: Usuario registra otra actividad de reciclaje"
      );

      const secondReward = ethers.parseEther("30"); // 30 tokens más

      await reciclaToken
        .connect(backend)
        .mintForActivity(
          user1.address,
          secondReward,
          "Reciclaje de 30kg de cartón"
        );

      // Verificar balance acumulado
      const balanceAfterSecond = await reciclaToken.balanceOf(user1.address);
      expect(balanceAfterSecond).to.equal(recycleReward + secondReward);

      console.log(
        `   ✅ Usuario ganó ${ethers.formatEther(secondReward)} REC adicionales`
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
      const expectedFinalBalance = recycleReward + secondReward - redeemAmount;
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
      expect(earned).to.equal(recycleReward + secondReward);
      expect(spent).to.equal(redeemAmount);
      expect(current).to.equal(expectedFinalBalance);

      // Verificar supply total
      const totalSupply = await reciclaToken.totalSupply();
      const expectedSupply = recycleReward + secondReward - redeemAmount;
      expect(totalSupply).to.equal(expectedSupply);

      console.log(
        `   📈 Supply total: ${ethers.formatEther(totalSupply)} REC\n`
      );
    });

    it("Debe permitir múltiples usuarios reciclando simultáneamente", async function () {
      console.log("\n   👥 MÚLTIPLES USUARIOS RECICLANDO");

      const reward1 = ethers.parseEther("100");
      const reward2 = ethers.parseEther("75");

      // Usuario 1 recicla
      await reciclaToken
        .connect(backend)
        .mintForActivity(user1.address, reward1, "Reciclaje usuario 1");

      // Usuario 2 recicla
      await reciclaToken
        .connect(backend)
        .mintForActivity(user2.address, reward2, "Reciclaje usuario 2");

      // Verificar balances
      const balance1 = await reciclaToken.balanceOf(user1.address);
      const balance2 = await reciclaToken.balanceOf(user2.address);

      expect(balance1).to.equal(reward1);
      expect(balance2).to.equal(reward2);

      console.log(`   ✅ Usuario 1: ${ethers.formatEther(balance1)} REC`);
      console.log(`   ✅ Usuario 2: ${ethers.formatEther(balance2)} REC\n`);
    });
  });
});
