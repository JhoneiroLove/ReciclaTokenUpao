import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Para ESM: obtener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== CONFIGURACIÓN ====================
export const DEFAULT_RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
export const CHAIN_ID = process.env.CHAIN_ID || "31337";

// ==================== PROVIDER ====================
export const provider = new ethers.JsonRpcProvider(DEFAULT_RPC);

// ==================== UTILIDADES ====================

/**
 * Lee las direcciones de los contratos desplegados
 */
export function getDeployedAddresses(): { token: string } {
  try {
    const deploymentPath = path.join(
      __dirname,
      "..",
      "deployments",
      "localhost.json"
    );

    const data = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

    return {
      token: data.ReciclaToken,
    };
  } catch (error) {
    throw new Error(
      "No se encontraron contratos desplegados. Ejecuta: npm run deploy:local"
    );
  }
}
/**
 * Lee el ABI de un contrato compilado
 */
function getABI(contractName: string): any[] {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return artifact.abi;
}

/**
 * Obtiene los contratos con un signer específico
 */
export function getContracts(signer?: ethers.Signer) {
  const addresses = getDeployedAddresses();

  const tokenABI = getABI("ReciclaToken");

  const token = new ethers.Contract(
    addresses.token,
    tokenABI,
    signer || provider
  );

  return { token, addresses };
}

/**
 * Obtiene los signers predefinidos
 */
export async function getSigners() {
  const [admin, backend, validator1, validator2, user1, user2, user3, user4] =
    await Promise.all([
      provider.getSigner(0), // Admin
      provider.getSigner(1), // Backend (PROPOSER_ROLE)
      provider.getSigner(2), // Validador 1 - Admin Ambiental UPAO
      provider.getSigner(3), // Validador 2 - Centro de Acopio
      provider.getSigner(4), // Usuario 1
      provider.getSigner(5), // Usuario 2
      provider.getSigner(6), // Usuario 3
      provider.getSigner(7), // Usuario 4
    ]);

  return { admin, backend, validator1, validator2, user1, user2, user3, user4 };
}

/**
 * Formatea tokens REC (18 decimales)
 */
export const formatREC = (value: bigint): string => {
  return ethers.formatEther(value);
};

/**
 * Parsea tokens REC a wei
 */
export const parseREC = (value: string): bigint => {
  return ethers.parseEther(value);
};

/**
 * Formatea MATIC
 */
export const formatMATIC = (value: bigint): string => {
  return ethers.formatEther(value);
};

/**
 * Parsea MATIC a wei
 */
export const parseMATIC = (value: string): bigint => {
  return ethers.parseEther(value);
};
