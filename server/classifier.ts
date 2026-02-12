import type { Transaction } from "@shared/schema";

const DEMO_CLASSIFICATIONS: Record<string, { newLabel: string; confidence: number; reason: string; ruleId: string; reviewStatus: "Auto" | "NeedsReview" | "ManuallyEdited" }> = {
  "0xaave_borrow_tx_001": {
    newLabel: "Loan (Borrow)",
    confidence: 0.95,
    reason: "Detected Aave Pool Borrow event (demo mode — matched known borrow tx hash)",
    ruleId: "AAVE_BORROW_V1",
    reviewStatus: "Auto",
  },
  "0xaave_borrow_tx_002": {
    newLabel: "Loan (Borrow)",
    confidence: 0.95,
    reason: "Detected Aave Pool Borrow event (demo mode — matched known borrow tx hash)",
    ruleId: "AAVE_BORROW_V1",
    reviewStatus: "Auto",
  },
  "0xaave_repay_tx_001": {
    newLabel: "Loan Repayment",
    confidence: 0.95,
    reason: "Detected Aave Pool Repay event (demo mode — matched known repay tx hash)",
    ruleId: "AAVE_REPAY_V1",
    reviewStatus: "Auto",
  },
  "0xaave_repay_tx_002": {
    newLabel: "Loan Repayment",
    confidence: 0.95,
    reason: "Detected Aave Pool Repay event (demo mode — matched known repay tx hash)",
    ruleId: "AAVE_REPAY_V1",
    reviewStatus: "Auto",
  },
};

const AAVE_POOL_ABI_EVENTS = [
  "event Borrow(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint8 interestRateMode, uint256 borrowRate, uint16 indexed referralCode)",
  "event Repay(address indexed reserve, address indexed user, address indexed repayer, uint256 amount, bool useATokens)",
];

const AAVE_POOL_ADDRESS = process.env.AAVE_POOL_ADDRESS || "0x794a61358D6845594F94dc1DB02A252b5b4814aD";

export async function classifyTransactions(
  transactions: Transaction[],
  demoMode: boolean = true
): Promise<Transaction[]> {
  const results: Transaction[] = [];

  for (const tx of transactions) {
    if (demoMode) {
      const demoResult = DEMO_CLASSIFICATIONS[tx.txHash];
      if (demoResult) {
        results.push({ ...tx, ...demoResult });
      } else {
        results.push({
          ...tx,
          newLabel: tx.originalLabel || "Needs Review",
          confidence: 0.20,
          reason: "No protocol rule matched",
          ruleId: "NO_MATCH",
          reviewStatus: "NeedsReview",
        });
      }
    } else {
      const classified = await classifyOnChain(tx);
      results.push(classified);
    }
  }

  return results;
}

async function classifyOnChain(tx: Transaction): Promise<Transaction> {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    return {
      ...tx,
      newLabel: tx.originalLabel || "Needs Review",
      confidence: 0.10,
      reason: "RPC_URL not configured — cannot decode on-chain",
      ruleId: "NO_RPC",
      reviewStatus: "NeedsReview",
    };
  }

  try {
    const { ethers } = await import("ethers");
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const receipt = await provider.getTransactionReceipt(tx.txHash);

    if (!receipt) {
      return {
        ...tx,
        newLabel: tx.originalLabel || "Needs Review",
        confidence: 0.10,
        reason: "Receipt fetch failed — transaction not found",
        ruleId: "RECEIPT_FAIL",
        reviewStatus: "NeedsReview",
      };
    }

    const iface = new ethers.Interface(AAVE_POOL_ABI_EVENTS);
    const poolAddr = AAVE_POOL_ADDRESS.toLowerCase();

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== poolAddr) continue;

      try {
        const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
        if (!parsed) continue;

        if (parsed.name === "Borrow") {
          return {
            ...tx,
            newLabel: "Loan (Borrow)",
            confidence: 0.95,
            reason: `Detected Aave Pool Borrow event in log #${receipt.logs.indexOf(log)}`,
            ruleId: "AAVE_BORROW_V1",
            reviewStatus: "Auto",
          };
        }

        if (parsed.name === "Repay") {
          return {
            ...tx,
            newLabel: "Loan Repayment",
            confidence: 0.95,
            reason: `Detected Aave Pool Repay event in log #${receipt.logs.indexOf(log)}`,
            ruleId: "AAVE_REPAY_V1",
            reviewStatus: "Auto",
          };
        }
      } catch {
        // Log doesn't match Aave events, skip
      }
    }

    return {
      ...tx,
      newLabel: tx.originalLabel || "Needs Review",
      confidence: 0.20,
      reason: "No Aave Borrow/Repay events found in transaction logs",
      ruleId: "NO_MATCH",
      reviewStatus: "NeedsReview",
    };
  } catch (err: any) {
    return {
      ...tx,
      newLabel: tx.originalLabel || "Needs Review",
      confidence: 0.10,
      reason: `Receipt fetch failed: ${err.message || "unknown error"}`,
      ruleId: "RECEIPT_FAIL",
      reviewStatus: "NeedsReview",
    };
  }
}
