const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface TransactionRequest {
  sender_address: string;
  recipient_address: string;
  amount: number;
  sender_wallet_age?: number;
  recipient_wallet_age?: number;
}

export interface RiskFactor {
  feature: string;
  name: string;
  contribution: number;
  value: number;
}

export interface AnalysisResponse {
  tx_id: string;
  sender_address: string;
  recipient_address: string;
  amount: number;
  risk_score: number;
  risk_level: string;
  action: string;
  description: string;
  risk_factors: RiskFactor[];
  fraud_probability: number;
  features: Record<string, number>;
  timestamp: number;
}

export interface WatchlistItem {
  address: string;
  category: string;
  risk_level: string;
  reported_date: string;
  reports_count: number;
  status: string;
}

export async function analyzeTransaction(
  data: TransactionRequest
): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Analysis failed");
  }

  return response.json();
}

// ── FEATURE 1: BATCH SCANNER API ──────────────────────────────────────────
export async function batchAnalyze(
  transactions: TransactionRequest[]
): Promise<{
  batch_size: number;
  total_amount_eth: number;
  high_risk_count: number;
  results: AnalysisResponse[];
}> {
  const response = await fetch(`${API_BASE}/api/batch-analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions }),
  });

  if (!response.ok) {
    throw new Error("Batch analysis failed");
  }

  return response.json();
}

// ── FEATURE 2: MALICIOUS WATCHLIST API ────────────────────────────────────
export async function getWatchlist(): Promise<{
  watchlist: WatchlistItem[];
  count: number;
}> {
  const response = await fetch(`${API_BASE}/api/watchlist`);
  if (!response.ok) {
    throw new Error("Failed to fetch watchlist");
  }
  return response.json();
}

export async function reportAddress(
  address: string,
  category: string
): Promise<{ status: string; entry: WatchlistItem }> {
  const response = await fetch(`${API_BASE}/api/watchlist/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, category }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit address report");
  }

  return response.json();
}

// ── FEATURE 3: POLICY SIMULATOR API ───────────────────────────────────────
export async function simulatePolicy(
  low_max: number,
  medium_max: number
): Promise<{
  configured_thresholds: {
    low_range: string;
    medium_range: string;
    high_range: string;
  };
  simulation: {
    risk_score: number;
    risk_level: string;
    action: string;
    description: string;
  }[];
}> {
  const response = await fetch(`${API_BASE}/api/policy/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ low_max, medium_max }),
  });

  if (!response.ok) {
    throw new Error("Policy simulation failed");
  }

  return response.json();
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
