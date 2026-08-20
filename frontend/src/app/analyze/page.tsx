"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { analyzeTransaction, type AnalysisResponse } from "@/lib/api";
import {
  connectWallet,
  recordAssessment,
  isMetaMaskInstalled,
} from "@/lib/blockchain";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AnalyzePage() {
  // Form state
  const [senderAddress, setSenderAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientWalletAge, setRecipientWalletAge] = useState("");
  const [currency, setCurrency] = useState<"ETH" | "USD" | "SOL">("ETH");

  // Advanced Threat Sliders
  const [sensitivity, setSensitivity] = useState<number>(1.0);

  // Result state
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFeatureInspector, setShowFeatureInspector] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState(false);

  // Blockchain state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [blockchainTxHash, setBlockchainTxHash] = useState("");
  const [recordingOnChain, setRecordingOnChain] = useState(false);
  const [blockchainError, setBlockchainError] = useState("");

  const ethPriceUSD = 3200; // Estimated exchange rate for UI display

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setBlockchainTxHash("");
    setBlockchainError("");
    setLoading(true);

    try {
      const ethVal = currency === "USD" ? parseFloat(amount) / ethPriceUSD : parseFloat(amount);

      const response = await analyzeTransaction({
        sender_address: senderAddress,
        recipient_address: recipientAddress,
        amount: ethVal,
        recipient_wallet_age: recipientWalletAge
          ? parseInt(recipientWalletAge)
          : undefined,
      });

      // Apply sensitivity multiplier if tuned
      if (sensitivity !== 1.0) {
        const adjustedScore = Math.min(Math.round(response.risk_score * sensitivity), 100);
        response.risk_score = adjustedScore;
        if (adjustedScore <= 30) {
          response.risk_level = "Low";
          response.action = "Allow";
        } else if (adjustedScore <= 70) {
          response.risk_level = "Medium";
          response.action = "Warn";
        } else {
          response.risk_level = "High";
          response.action = "Hold";
        }
      }

      setResult(response);

      // Save to localStorage
      const stored = localStorage.getItem("fraudshield_history");
      const history = stored ? JSON.parse(stored) : [];
      history.push(response);
      localStorage.setItem("fraudshield_history", JSON.stringify(history));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletConnected(true);
      setWalletAddress(address);
      setBlockchainError("");
    } catch (err) {
      setBlockchainError(
        err instanceof Error ? err.message : "Failed to connect wallet"
      );
    }
  };

  const handleRecordOnChain = async () => {
    if (!result) return;
    setRecordingOnChain(true);
    setBlockchainError("");

    try {
      const txHash = await recordAssessment(
        result.tx_id,
        result.sender_address,
        result.recipient_address,
        result.risk_score,
        result.risk_level,
        result.action
      );
      setBlockchainTxHash(txHash);

      // Update localStorage with blockchain tx hash
      const stored = localStorage.getItem("fraudshield_history");
      if (stored) {
        const history = JSON.parse(stored);
        const idx = history.findIndex(
          (t: AnalysisResponse) => t.tx_id === result.tx_id
        );
        if (idx >= 0) {
          history[idx].blockchain_tx_hash = txHash;
          localStorage.setItem("fraudshield_history", JSON.stringify(history));
        }
      }
    } catch (err) {
      setBlockchainError(
        err instanceof Error ? err.message : "Failed to record on blockchain"
      );
    } finally {
      setRecordingOnChain(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleCopyTxId = () => {
    if (result) {
      navigator.clipboard.writeText(result.tx_id);
      setCopiedTxId(true);
      setTimeout(() => setCopiedTxId(false), 2000);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "#10b981";
      case "Medium": return "#f59e0b";
      case "High": return "#ef4444";
      default: return "var(--text-primary)";
    }
  };

  const getGaugeGradient = (level: string) => {
    switch (level) {
      case "Low": return "linear-gradient(135deg, #10b981, #06b6d4)";
      case "Medium": return "linear-gradient(135deg, #f59e0b, #f97316)";
      case "High": return "linear-gradient(135deg, #ef4444, #f43f5e)";
      default: return "var(--gradient-primary)";
    }
  };

  const presetProfiles = [
    {
      name: "🔴 Drainer Scam",
      sender: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
      recipient: "0xDEADBEEF00000000000000000000000000000001",
      amount: "4.5",
      age: "3",
    },
    {
      name: "🟡 Value Anomaly",
      sender: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
      recipient: "0x9999999999999999999999999999999999999999",
      amount: "15.0",
      age: "45",
    },
    {
      name: "🟢 Safe Transfer",
      sender: "0x1111111111111111111111111111111111111111",
      recipient: "0x2222222222222222222222222222222222222222",
      amount: "0.1",
      age: "450",
    },
    {
      name: "⚡ Mixer Deposit",
      sender: "0x3333333333333333333333333333333333333333",
      recipient: "0x8888888888888888888888888888888888888888",
      amount: "50.0",
      age: "1",
    },
  ];

  const applyProfile = (p: typeof presetProfiles[0]) => {
    setSenderAddress(p.sender);
    setRecipientAddress(p.recipient);
    setAmount(p.amount);
    setRecipientWalletAge(p.age);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
      {/* Header */}
      <div className="page-header">
        <h1>Interactive Transaction Risk Workbench</h1>
        <p>
          AI predictive fraud evaluation, network flow topology, explainable feature analysis & on-chain audit anchor
        </p>
      </div>

      {/* Preset Threat Profiles Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", overflowX: "auto", paddingBottom: "4px" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
          Threat Scenarios:
        </span>
        {presetProfiles.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applyProfile(p)}
            className="btn btn-secondary"
            style={{ padding: "6px 12px", fontSize: "0.76rem", whiteSpace: "nowrap" }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Form Card */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="#6366f1"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v2H7V5zm6 5H7v2h6v-2zm-6 4h6v2H7v-2z" clipRule="evenodd" /></svg>
              Transaction Inputs
            </h2>
            {/* Currency Selector */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
              {(["ETH", "USD", "SOL"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    border: "none",
                    background: currency === c ? "#6366f1" : "transparent",
                    color: currency === c ? "white" : "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label className="form-label">Sender Wallet Address</label>
              <input
                type="text"
                className="form-input address"
                placeholder="0x742d35Cc..."
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Wallet Address</label>
              <input
                type="text"
                className="form-input address"
                placeholder="0xDEADBEEF..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  className="form-input"
                  placeholder="1.5"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                {amount && currency === "ETH" && (
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                    ≈ ${(parseFloat(amount) * ethPriceUSD).toLocaleString()} USD
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Wallet Age (Days)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 3 or 500"
                  value={recipientWalletAge}
                  onChange={(e) => setRecipientWalletAge(e.target.value)}
                />
              </div>
            </div>

            {/* Threat Sensitivity Tuning Slider */}
            <div style={{ marginTop: "8px", marginBottom: "16px", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>AI Threat Sensitivity Tuning</span>
                <span style={{ color: "#a5b4fc", fontWeight: 800 }}>{sensitivity.toFixed(1)}x Multiplier</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer" }}
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
                  <div className="spinner" /> Running Random Forest ML Engine...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Execute AI Fraud Analysis
                </>
              )}
            </button>

            {error && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "var(--risk-high-bg)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "var(--risk-high)",
                  fontSize: "0.82rem",
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>

        {/* Result / Placeholder Panel */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="glass-card"
              style={{ padding: "28px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="#a855f7"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                  AI Risk Evaluation
                </h2>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={handleCopyTxId}
                    className="btn btn-secondary"
                    style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                  >
                    {copiedTxId ? "✅ Copied" : "📋 Copy ID"}
                  </button>
                  <button
                    onClick={handlePrintReport}
                    className="btn btn-secondary"
                    style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                  >
                    🖨️ Certificate
                  </button>
                </div>
              </div>

              <div className="risk-gauge-container" style={{ padding: "16px" }}>
                <div className="risk-gauge">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="85" fill="none" strokeWidth="12" className="risk-gauge-bg" />
                    <circle
                      cx="100" cy="100" r="85" fill="none" strokeWidth="12"
                      stroke={getRiskColor(result.risk_level)}
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 85}
                      strokeDashoffset={2 * Math.PI * 85 * (1 - result.risk_score / 100)}
                      className="risk-gauge-fill"
                      style={{ filter: `drop-shadow(0 0 10px ${getRiskColor(result.risk_level)}60)` }}
                    />
                  </svg>
                  <div className="risk-gauge-center">
                    <div className="risk-gauge-score" style={{ color: getRiskColor(result.risk_level) }}>
                      {result.risk_score}
                    </div>
                    <div className="risk-gauge-label" style={{ color: getRiskColor(result.risk_level) }}>
                      {result.risk_level} Risk
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <span
                    className={`action-badge ${result.action.toLowerCase()}`}
                    style={{ fontSize: "0.85rem", padding: "6px 18px" }}
                  >
                    Policy Recommendation: {result.action}
                  </span>
                  <p style={{ marginTop: "12px", fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "340px", lineHeight: 1.5 }}>
                    {result.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
              style={{
                padding: "36px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(99, 102, 241, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                Ready for Analysis
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", maxWidth: "300px", lineHeight: 1.6 }}>
                Select a threat scenario above or enter wallet parameters to run risk inference.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NEW FEATURE: Visual Network Flow Topology Node Card */}
      {result && (
        <motion.div
          className="glass-card"
          style={{ padding: "24px", marginTop: "24px" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
            Network Topology Flow Inspection
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            {/* Sender Node */}
            <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", flex: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>SENDER WALLET</div>
              <div className="address" style={{ fontSize: "0.82rem", color: "#a5b4fc", marginTop: "2px", fontWeight: 600 }}>
                {result.sender_address.slice(0, 8)}...{result.sender_address.slice(-6)}
              </div>
            </div>

            {/* Shield Node */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: getGaugeGradient(result.risk_level), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "white", fontWeight: 800 }}>
                🛡️
              </div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: getRiskColor(result.risk_level), marginTop: "4px" }}>
                Score: {result.risk_score}
              </span>
            </div>

            {/* Recipient Node */}
            <div style={{ padding: "14px 18px", borderRadius: "12px", background: result.risk_level === "High" ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)", border: `1px solid ${getRiskColor(result.risk_level)}30`, flex: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>RECIPIENT DESTINATION</div>
              <div className="address" style={{ fontSize: "0.82rem", color: getRiskColor(result.risk_level), marginTop: "2px", fontWeight: 600 }}>
                {result.recipient_address.slice(0, 8)}...{result.recipient_address.slice(-6)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Risk Factors & Blockchain — shown after analysis */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginTop: "24px",
            }}
          >
            {/* Risk Factors */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="#06b6d4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  Explainable Risk Breakdown
                </h2>

                <button
                  type="button"
                  onClick={() => setShowFeatureInspector(!showFeatureInspector)}
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                >
                  {showFeatureInspector ? "Hide Matrix" : "🔍 Feature Matrix"}
                </button>
              </div>

              {/* Feature Inspector Accordion */}
              {showFeatureInspector && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{ marginBottom: "20px", padding: "12px", borderRadius: "10px", background: "rgba(6,8,15,0.9)", border: "1px solid var(--border-glass)" }}
                >
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                    Raw Extracted Feature Engine Matrix
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.75rem", fontFamily: "monospace" }}>
                    {Object.entries(result.features).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.03)", padding: "2px 0" }}>
                        <span style={{ color: "var(--text-muted)" }}>{k}:</span>
                        <span style={{ color: "#a5b4fc", fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {result.risk_factors.map((factor, i) => (
                <motion.div
                  key={factor.feature}
                  className="risk-factor"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                >
                  <div className="risk-factor-header">
                    <span className="risk-factor-name">
                      <span className="dot" style={{ background: getRiskColor(result.risk_level) }} />
                      {factor.name}
                    </span>
                    <span className="risk-factor-value" style={{ color: getRiskColor(result.risk_level) }}>
                      +{factor.contribution} pts
                    </span>
                  </div>
                  <div className="risk-factor-bar">
                    <motion.div
                      className="risk-factor-fill"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((factor.contribution / result.risk_score) * 100, 100)}%`,
                      }}
                      transition={{ delay: 0.35 + i * 0.08, duration: 0.7 }}
                      style={{ background: getGaugeGradient(result.risk_level) }}
                    />
                  </div>
                </motion.div>
              ))}

              <div style={{ marginTop: "20px", padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Transaction ID</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.84rem", color: "#a5b4fc", marginTop: "2px" }}>{result.tx_id}</div>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Prob: {(result.fraud_probability * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Blockchain Recording */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="#10b981"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                On-Chain Audit Trail
              </h2>

              {!isMetaMaskInstalled() ? (
                <div style={{ padding: "20px", textAlign: "center", borderRadius: "14px", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🦊</div>
                  <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    MetaMask browser extension is needed to sign audit logs.
                  </p>
                  <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="btn btn-blockchain" style={{ textDecoration: "none" }}>
                    Install MetaMask
                  </a>
                </div>
              ) : !walletConnected ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                    Connect wallet to record this decision on Hardhat local testnet.
                  </p>
                  <button onClick={handleConnectWallet} className="btn btn-blockchain">
                    🦊 Connect MetaMask Wallet
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.15)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Connected: <span className="address" style={{ color: "#a5b4fc" }}>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                    </span>
                  </div>

                  {!blockchainTxHash ? (
                    <button onClick={handleRecordOnChain} className="btn btn-primary" disabled={recordingOnChain} style={{ width: "100%" }}>
                      {recordingOnChain ? (
                        <>
                          <div className="spinner" /> Signing & Transacting...
                        </>
                      ) : (
                        <>🔏 Record Security Assessment On-Chain</>
                      )}
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="blockchain-status">
                      <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#10b981", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                        ✅ Assessment Recorded On-Chain
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>Transaction Hash</div>
                      <div className="blockchain-hash">{blockchainTxHash}</div>
                    </motion.div>
                  )}
                </div>
              )}

              {blockchainError && (
                <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "10px", background: "var(--risk-high-bg)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "var(--risk-high)", fontSize: "0.8rem" }}>
                  ❌ {blockchainError}
                </div>
              )}

              {/* Assessment Summary */}
              <div style={{ marginTop: "24px" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Summary Record
                </h3>
                <div style={{ display: "grid", gap: "8px" }}>
                  {[
                    ["Sender", result.sender_address],
                    ["Recipient", result.recipient_address],
                    ["Amount", `${result.amount} ETH`],
                    ["Risk Score", `${result.risk_score}/100`],
                    ["Risk Level", result.risk_level],
                    ["Action", result.action],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <span style={{ color: "var(--text-muted)" }}>{label}</span>
                      <span className={label === "Sender" || label === "Recipient" ? "address address-short" : ""} style={{ fontWeight: 600 }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
