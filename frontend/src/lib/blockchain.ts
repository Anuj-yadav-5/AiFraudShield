import { BrowserProvider, Contract, ethers } from "ethers";
import contractABI from "./contract-abi.json";

// Default contract address — update after deployment
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ── Types ────────────────────────────────────────────────────────────────
export interface BlockchainRecord {
  txHash: string;
  txId: string;
  sender: string;
  recipient: string;
  riskScore: number;
  riskLevel: string;
  action: string;
}

// ── Hardhat Network Auto-Switch ──────────────────────────────────────────

const HARDHAT_CHAIN_ID = "0x7A69"; // 31337 in hex

async function switchToHardhat(): Promise<void> {
  if (!window.ethereum) return;

  try {
    // Try switching to Hardhat network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HARDHAT_CHAIN_ID }],
    });
  } catch (switchError: unknown) {
    // If the network doesn't exist, add it
    const err = switchError as { code?: number };
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: HARDHAT_CHAIN_ID,
            chainName: "Hardhat Local",
            rpcUrls: ["http://127.0.0.1:8545"],
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
          },
        ],
      });
    }
  }
}

// ── Provider & Signer ────────────────────────────────────────────────────

export async function connectWallet(): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  // Auto-switch to Hardhat network
  await switchToHardhat();

  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
}

export async function getContract(withSigner = false): Promise<Contract> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new BrowserProvider(window.ethereum);

  if (withSigner) {
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, contractABI, signer);
  }

  return new Contract(CONTRACT_ADDRESS, contractABI, provider);
}

// ── Write Functions ──────────────────────────────────────────────────────

export async function recordAssessment(
  txId: string,
  sender: string,
  recipient: string,
  riskScore: number,
  riskLevel: string,
  action: string
): Promise<string> {
  const contract = await getContract(true);

  // Ensure addresses are valid
  const senderAddr = ethers.isAddress(sender)
    ? sender
    : "0x0000000000000000000000000000000000000001";
  const recipientAddr = ethers.isAddress(recipient)
    ? recipient
    : "0x0000000000000000000000000000000000000002";

  const tx = await contract.recordRiskAssessment(
    txId,
    senderAddr,
    recipientAddr,
    riskScore,
    riskLevel,
    action
  );

  const receipt = await tx.wait();
  return receipt.hash;
}

// ── Read Functions ───────────────────────────────────────────────────────

export async function getAssessmentCount(): Promise<number> {
  try {
    const contract = await getContract();
    const count = await contract.getAssessmentCount();
    return Number(count);
  } catch {
    return 0;
  }
}

export async function getAssessment(
  txId: string
): Promise<BlockchainRecord | null> {
  try {
    const contract = await getContract();
    const result = await contract.getRiskAssessment(txId);
    return {
      txHash: "",
      txId: result[0],
      sender: result[1],
      recipient: result[2],
      riskScore: Number(result[3]),
      riskLevel: result[4],
      action: result[5],
    };
  } catch {
    return null;
  }
}

// ── MetaMask Detection ───────────────────────────────────────────────────

export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

// ── Extend Window ────────────────────────────────────────────────────────
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
