import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Módulo de deployment para ReciclaUPAO
 * Sistema de incentivos tokenizado para reciclaje universitario
 */
const ReciclaModule = buildModule("ReciclaModule", (m) => {
  const adminAddress = m.getParameter(
    "adminAddress",
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );
  const backendWallet = m.getParameter(
    "backendWallet",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  );

  // Desplegar el token REC
  const reciclaToken = m.contract("ReciclaToken", [
    adminAddress,
    backendWallet,
  ]);

  return {
    reciclaToken,
  };
});

export default ReciclaModule;
