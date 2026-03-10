import type { Transaction } from "@shared/schema";
import { randomUUID } from "crypto";

const NOVES_BASE_URL = "https://translate.noves.fi";

// ---------------------------------------------------------------------------
// Supported chains (Noves chain slug → display name)
// ---------------------------------------------------------------------------

export const NOVES_CHAINS: Array<{ id: string; name: string }> = [
  { id: "eth", name: "Ethereum" },
  { id: "arbitrum", name: "Arbitrum" },
  { id: "base", name: "Base" },
  { id: "polygon", name: "Polygon" },
  { id: "optimism", name: "Optimism" },
  { id: "bsc", name: "BNB Chain" },
  { id: "avalanche", name: "Avalanche" },
  { id: "fantom", name: "Fantom" },
  { id: "linea", name: "Linea" },
  { id: "zksync", name: "zkSync Era" },
];

// ---------------------------------------------------------------------------
// Noves transaction type → our accounting label
// ---------------------------------------------------------------------------

const TYPE_MAP: Record<string, string> = {
  swap: "Trade",
  trade: "Trade",
  nfttrade: "Trade",
  nftsale: "Income",
  nftmint: "Income",
  stake: "Staking",
  staking: "Staking",
  deposit: "Liquidity Add",
  withdraw: "Liquidity Remove",
  claimrewards: "Staking Reward",
  harvestrewards: "Staking Reward",
  harvest: "Staking Reward",
  yield: "Staking Reward",
  compound: "Staking",
  addliquidity: "Liquidity Add",
  removeliquidity: "Liquidity Remove",
  provideLiquidity: "Liquidity Add",
  borrow: "Borrow",
  flashloan: "Borrow",
  repay: "Repay",
  transfer: "Transfer",
  receive: "Transfer",
  send: "Transfer",
  wrap: "Transfer",
  unwrap: "Transfer",
  bridge: "Bridge",
  airdrop: "Airdrop",
  mint: "Income",
  burn: "Expense",
  lend: "Liquidity Add",
  redeem: "Liquidity Remove",
  vote: "Transfer",
};

// Types we drop entirely (no accounting impact)
const IGNORE_TYPES = new Set(["approve", "approval", "revoke", "permit"]);

// ---------------------------------------------------------------------------
// Noves API response types
// ---------------------------------------------------------------------------

interface NovesAsset {
  symbol: string;
  name?: string;
  address?: string;
}

interface NovesTransfer {
  action: string;
  amount: string;
  asset: NovesAsset;
}

interface NovesClassification {
  type: string;
  description: string;
  protocol?: { name: string; url?: string };
  sent?: NovesTransfer[];
  received?: NovesTransfer[];
}

interface NovesItem {
  txHash?: string;
  timestamp?: number;
  classificationData?: NovesClassification;
  rawTransactionData?: {
    transactionHash?: string;
    fromAddress?: string;
    toAddress?: string;
    timestamp?: number;
  };
}

interface NovesResponse {
  account?: { address: string };
  items: NovesItem[];
  hasNextPage: boolean;
  nextPageUrl?: string | null;
}

// ---------------------------------------------------------------------------
// Map a Noves item to our Transaction type
// ---------------------------------------------------------------------------

function novesItemToTransaction(
  item: NovesItem,
  walletAddress: string,
  chain: string
): Transaction | null {
  const txHash =
    item.txHash ||
    item.rawTransactionData?.transactionHash ||
    "";

  if (!txHash) return null;

  const classification = item.classificationData;
  const rawType = classification?.type ?? "unknown";

  if (IGNORE_TYPES.has(rawType.toLowerCase())) return null;

  const label =
    TYPE_MAP[rawType.toLowerCase()] ??
    TYPE_MAP[rawType] ??
    "Needs Review";

  // Prefer the sent asset for the primary amount/asset; fall back to received
  const primary =
    classification?.sent?.[0] ??
    classification?.received?.[0] ??
    null;

  const ts =
    item.timestamp ??
    item.rawTransactionData?.timestamp ??
    null;

  const protocol = classification?.protocol?.name ?? "";
  const description = classification?.description ?? "";
  const reasonParts = [description, protocol ? `Protocol: ${protocol}` : ""].filter(Boolean);

  return {
    id: randomUUID(),
    timestamp: ts ? new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 19) : "",
    wallet: walletAddress,
    chain,
    txHash,
    asset: primary?.asset?.symbol ?? "",
    amount: primary?.amount ?? "",
    direction: classification?.sent?.length ? "out" : "in",
    originalLabel: rawType,
    newLabel: label,
    confidence: label !== "Needs Review" ? 0.9 : 0.2,
    reason: reasonParts.length
      ? `Noves: ${reasonParts.join(" — ")}`
      : `Noves type: ${rawType}`,
    ruleId: `NOVES_${rawType.toUpperCase()}`,
    reviewStatus: label !== "Needs Review" ? "Auto" : "NeedsReview",
  };
}

// ---------------------------------------------------------------------------
// Fetch transactions for a wallet from the Noves Translate API
// ---------------------------------------------------------------------------

export async function fetchNovesTransactions(
  chain: string,
  walletAddress: string,
  apiKey: string,
  maxPages = 5
): Promise<{ transactions: Transaction[]; truncated: boolean }> {
  const transactions: Transaction[] = [];
  let url: string | null =
    `${NOVES_BASE_URL}/evm/${chain}/txs/${walletAddress}?pageSize=50`;
  let page = 0;
  let truncated = false;

  while (url && page < maxPages) {
    const res = await fetch(url, {
      headers: { apiKey },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => res.statusText);
      if (res.status === 401) {
        throw new Error("Noves API key is invalid or missing.");
      }
      if (res.status === 404) {
        throw new Error(
          `Chain "${chain}" or wallet address not found on Noves. Check the chain slug and address.`
        );
      }
      throw new Error(`Noves API error ${res.status}: ${body}`);
    }

    const data: NovesResponse = await res.json();

    for (const item of data.items) {
      const tx = novesItemToTransaction(item, walletAddress, chain);
      if (tx) transactions.push(tx);
    }

    if (data.hasNextPage && data.nextPageUrl) {
      url = data.nextPageUrl;
      page++;
    } else {
      url = null;
    }
  }

  if (url !== null) {
    // We stopped because maxPages was hit, not because there are no more
    truncated = true;
  }

  return { transactions, truncated };
}
