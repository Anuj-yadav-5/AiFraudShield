"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { batchAnalyze, type AnalysisResponse } from "@/lib/api";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SAMPLE_BATCH_JSON = JSON.stringify(
  [
    {
      sender_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
      recipient_address: "0xDEADBEEF00000000000000000000000000000001",
      amount: 4.5,
      recipient_wallet_age: 3,
    },
    {
      sender_address: "0x1111111111111111111111111111111111111111",
      recipient_address: "0x2222222222222222222222222222222222222222",
      amount: 0.1,
      recipient_wallet_age: 500,
    },
    {
      sender_address: "0x3333333333333333333333333333333333333333",
      recipient_address: "0x8888888888888888888888888888888888888888",
      amount: 12.0,
      recipient_wallet_age: 1,
    },
    {
      sender_address: "0x4444444444444444444444444444444444444444",
      recipient_address: "0x5555555555555555555555555555555555555555",
      amount: 2.3,
      recipient_wallet_age: 45,
    },
  ],
  null,
  2
);

export default function BatchScannerPage() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_BATCH_JSON);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [batchResult, setBatchResult] = useState<{
    batch_size: number;
    total_amount_eth: number;
    high_risk_count: number;
    results: AnalysisResponse[];
  } | null>(null);

  const handleBatchScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array of transaction objects.");
      }
      const response = await batchAnalyze(parsed);
      setBatchResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      {/* Page Header */}
      <div className="page-header">
        <h1>Batch Transaction Fraud Scanner</h1>
        <p>Analyze multiple cryptocurrency transactions at once for institutional compliance</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
        {/* Input Card */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
              Batch JSON Payload
            </h2>
            <button
              onClick={() => setJsonInput(SAMPLE_BATCH_JSON)}
              className="btn btn-secondary"
              style={{ padding: "5px 12px", fontSize: "0.72rem" }}
            >
              🔄 Reset Sample Data
            </button>
          </div>

          <form onSubmit={handleBatchScan}>
            <div className="form-group">
              <textarea
                className="form-input address"
                rows={14}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                style={{ fontSize: "0.78rem", lineHeight: 1.5 }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "14px" }}
            >
              {loading ? (
                <>
                  <div className="spinner" /> Batch Scanning...
                </>
              ) : (
                <>⚡ Scan Batch Transactions</>
              )}
            </button>

            {error && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "var(--risk-high-bg)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "var(--risk-high)",
                  fontSize: "0.82rem",
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>

        {/* Results Panel */}
        <div>
          {batchResult ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {/* Batch Summary Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
                <div className="glass-card" style={{ padding: "18px" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Batch Size</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#6366f1" }}>{batchResult.batch_size}</div>
                </div>
                <div className="glass-card" style={{ padding: "18px" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Volume</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#06b6d4" }}>{batchResult.total_amount_eth} ETH</div>
                </div>
                <div className="glass-card" style={{ padding: "18px" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>High Risk Flagged</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: batchResult.high_risk_count > 0 ? "#ef4444" : "#10b981" }}>
                    {batchResult.high_risk_count}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="glass-card" style={{ padding: "4px" }}>
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>TX ID</th>
                        <th>Amount</th>
                        <th>Risk Score</th>
                        <th>Level</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResult.results.map((tx) => (
                        <tr key={tx.tx_id}>
                          <td style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#a5b4fc" }}>{tx.tx_id}</td>
                          <td style={{ fontWeight: 600 }}>{tx.amount} ETH</td>
                          <td>
                            <span style={{ fontWeight: 800, color: tx.risk_score <= 30 ? "#10b981" : tx.risk_score <= 70 ? "#f59e0b" : "#ef4444" }}>
                              {tx.risk_score}%
                            </span>
                          </td>
                          <td><span className={`risk-badge ${tx.risk_level.toLowerCase()}`}>{tx.risk_level}</span></td>
                          <td><span className={`action-badge ${tx.action.toLowerCase()}`}>{tx.action}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <div
              className="glass-card"
              style={{
                padding: "48px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.3 }}>⚡</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>
                Batch Scanner Ready
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", maxWidth: "320px" }}>
                Click "Scan Batch Transactions" to evaluate all transactions in parallel and produce an institutional risk audit report.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
