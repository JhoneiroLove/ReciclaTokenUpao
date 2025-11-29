import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ReciclaModule = buildModule("ReciclaModule", (m) => {
  const adminAddress = m.getParameter(
    "adminAddress",
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );
  const backendWallet = m.getParameter(
    "backendWallet",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  );

  const tokenPriceInWei = m.getParameter("tokenPrice", "100000000000000000");

  const softCapInWei = m.getParameter("softCap", "50000000000000000000000");

  const hardCapInWei = m.getParameter("hardCap", "500000000000000000000000");

  const minPurchaseTokens = m.getParameter(
    "minPurchase",
    "100000000000000000000"
  );

  const maxPurchaseTokens = m.getParameter(
    "maxPurchase",
    "100000000000000000000000"
  );

  const reciclaToken = m.contract("ReciclaToken", [
    adminAddress,
    backendWallet,
  ]);

  const reciclaICO = m.contract("ReciclaICO", [
    reciclaToken,
    tokenPriceInWei,
    softCapInWei,
    hardCapInWei,
    minPurchaseTokens,
    maxPurchaseTokens,
  ]);

  return {
    reciclaToken,
    reciclaICO,
  };
});

export default ReciclaModule;
