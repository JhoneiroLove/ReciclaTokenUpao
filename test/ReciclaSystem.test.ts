import { expect } from "chai";
import { ethers } from "hardhat";
import { ReciclaToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ReciclaUPAO - Sistema de Incentivos Tokenizado", function () {
  let reciclaToken: ReciclaToken;
  let admin: SignerWithAddress;
  let backend: SignerWithAddress;
  let validator1: SignerWithAddress;
  let validator2: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    // Obtener signers
    [admin, backend, validator1, validator2, user1, user2] =
      await ethers.getSigners();

    // Desplegar ReciclaToken
    const ReciclaTokenFactory = await ethers.getContractFactory("ReciclaToken");
    reciclaToken = await ReciclaTokenFactory.deploy(
      admin.address,
      backend.address
    );

    // Otorgar roles de validador
    const VALIDATOR_ROLE = await reciclaToken.VALIDATOR_ROLE();
    await reciclaToken
      .connect(admin)
      .grantRole(VALIDATOR_ROLE, validator1.address);
    await reciclaToken
      .connect(admin)
      .grantRole(VALIDATOR_ROLE, validator2.address);

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
      // ==================== PASO 1: BACKEND PROPONE ACTIVIDAD ====================
      console.log("\n   📝 PASO 1: Backend propone actividad de reciclaje");

      const pesoKg = 50; // 50 kg de plástico
      const tipoMaterial = "plastico"; // 15 REC/kg
      const evidenciaIPFS = "QmTest123...abc";

      // Backend propone la actividad
      const tx = await reciclaToken
        .connect(backend)
        .proponerActividad(user1.address, pesoKg, tipoMaterial, evidenciaIPFS);

      await tx.wait();

      // Calcular tokens esperados: 50kg * 15 REC/kg = 750 REC
      const tokensEsperados = ethers.parseEther("750");

      // Verificar que la propuesta se creó (actividad ID 0)
      const actividad = await reciclaToken.actividades(0);
      expect(actividad.usuario).to.equal(user1.address);
      expect(actividad.pesoKg).to.equal(pesoKg);
      expect(actividad.tokensCalculados).to.equal(tokensEsperados);
      expect(actividad.ejecutada).to.be.false;
      expect(actividad.aprobaciones).to.equal(0);

      console.log(
        `   ✅ Propuesta creada: ${pesoKg}kg ${tipoMaterial} = ${ethers.formatEther(
          tokensEsperados
        )} REC`
      );

      // Usuario NO tiene tokens todavía (propuesta pendiente)
      let balance = await reciclaToken.balanceOf(user1.address);
      expect(balance).to.equal(0);

      // ==================== PASO 2: PRIMER VALIDADOR APRUEBA ====================
      console.log("\n   ✅ PASO 2: Validador 1 aprueba la actividad");

      await reciclaToken.connect(validator1).aprobarActividad(0);

      // Verificar aprobaciones
      const actividadDespuesVal1 = await reciclaToken.actividades(0);
      expect(actividadDespuesVal1.aprobaciones).to.equal(1);
      expect(actividadDespuesVal1.ejecutada).to.be.false; // Aún no ejecutada

      // Usuario SIGUE sin tokens (falta 1 aprobación más)
      balance = await reciclaToken.balanceOf(user1.address);
      expect(balance).to.equal(0);

      console.log("   ⏳ Aprobaciones: 1/2 - Aún no se acuñan tokens");

      // ==================== PASO 3: SEGUNDO VALIDADOR APRUEBA Y SE EJECUTA ====================
      console.log("\n   ✅ PASO 3: Validador 2 aprueba (alcanza umbral)");

      await reciclaToken.connect(validator2).aprobarActividad(0);

      // Verificar que se ejecutó automáticamente
      const actividadFinal = await reciclaToken.actividades(0);
      expect(actividadFinal.aprobaciones).to.equal(2);
      expect(actividadFinal.ejecutada).to.be.true;

      // Usuario AHORA SÍ tiene tokens
      balance = await reciclaToken.balanceOf(user1.address);
      expect(balance).to.equal(tokensEsperados);

      // Verificar tracking
      const totalEarned = await reciclaToken.totalTokensEarnedByUser(
        user1.address
      );
      expect(totalEarned).to.equal(tokensEsperados);

      console.log(
        `   🎉 ¡Tokens acuñados! Usuario recibió ${ethers.formatEther(
          tokensEsperados
        )} REC`
      );

      // ==================== PASO 4: SEGUNDA ACTIVIDAD DE RECICLAJE ====================
      console.log(
        "\n   ♻️  PASO 4: Usuario registra otra actividad de reciclaje"
      );

      const pesoKg2 = 30; // 30 kg de papel
      const tipoMaterial2 = "papel"; // 10 REC/kg
      const tokensEsperados2 = ethers.parseEther("300"); // 30 * 10 = 300

      // Backend propone segunda actividad
      await reciclaToken
        .connect(backend)
        .proponerActividad(
          user1.address,
          pesoKg2,
          tipoMaterial2,
          "QmTest456...def"
        );

      // Validadores aprueban rápidamente
      await reciclaToken.connect(validator1).aprobarActividad(1);
      await reciclaToken.connect(validator2).aprobarActividad(1);

      // Verificar balance acumulado
      const balanceAfterSecond = await reciclaToken.balanceOf(user1.address);
      const totalTokens = tokensEsperados + tokensEsperados2;
      expect(balanceAfterSecond).to.equal(totalTokens);

      console.log(
        `   ✅ Usuario ganó ${ethers.formatEther(
          tokensEsperados2
        )} REC adicionales`
      );

      // ==================== PASO 5: CANJE DE RECOMPENSA ====================
      console.log("\n   🎁 PASO 5: Usuario canjea recompensa");

      const redeemAmount = ethers.parseEther("250"); // 250 tokens

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
      const expectedFinalBalance = totalTokens - redeemAmount;
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
      expect(earned).to.equal(totalTokens);
      expect(spent).to.equal(redeemAmount);
      expect(current).to.equal(expectedFinalBalance);

      // Verificar supply total
      const totalSupply = await reciclaToken.totalSupply();
      const expectedSupply = totalTokens - redeemAmount;
      expect(totalSupply).to.equal(expectedSupply);

      console.log(
        `   📈 Supply total: ${ethers.formatEther(totalSupply)} REC\n`
      );
    });

    it("Debe permitir múltiples usuarios reciclando simultáneamente", async function () {
      console.log("\n   👥 MÚLTIPLES USUARIOS RECICLANDO");

      const pesoUser1 = 100; // 100 kg de plástico
      const pesoUser2 = 75; // 75 kg de plástico
      const reward1 = ethers.parseEther("1500"); // 100 * 15 = 1500 REC
      const reward2 = ethers.parseEther("1125"); // 75 * 15 = 1125 REC

      // Backend propone actividades de ambos usuarios
      await reciclaToken
        .connect(backend)
        .proponerActividad(
          user1.address,
          pesoUser1,
          "plastico",
          "QmUser1...abc"
        );

      await reciclaToken
        .connect(backend)
        .proponerActividad(
          user2.address,
          pesoUser2,
          "plastico",
          "QmUser2...def"
        );

      // Validadores aprueban actividad de usuario 1 (ID 0)
      await reciclaToken.connect(validator1).aprobarActividad(0);
      await reciclaToken.connect(validator2).aprobarActividad(0);

      // Validadores aprueban actividad de usuario 2 (ID 1)
      await reciclaToken.connect(validator1).aprobarActividad(1);
      await reciclaToken.connect(validator2).aprobarActividad(1);

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
