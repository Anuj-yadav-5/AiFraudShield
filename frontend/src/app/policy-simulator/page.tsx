"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { simulatePolicy } from "@/lib/api";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PolicySimulatorPage() {
  const [lowMax, setLowMax] = useState(30);
  const [mediumMax, setMediumMax] = useState(70);
  const [simData, setSimData] = useState<{
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
  } | null>(null);

  const runSimulation = async () => {
    try {
      const result = await simulatePolicy(lowMax, mediumMax);
      setSimData(result);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    runSimulation();
  }, [lowMax, mediumMax]);

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      {/* Page Header */}
      <div className="page-header">
        <h1>Policy Engine Simulator</h1>
        <p>Customize security policy threshold boundaries for dApps, exchanges, and payment workflows</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Policy Controls */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#6366f1"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
            Threshold Controls
          </h2>

          <div className="form-group" style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Low Risk Threshold Max (0 to {lowMax})</label>
              <span style={{ fontWeight: 800, color: "#10b981" }}>{lowMax}</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              value={lowMax}
              onChange={(e) => setLowMax(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#10b981", cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
              Transactions scored 0–{lowMax} trigger <strong>ALLOW</strong>.
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Medium Risk Threshold Max ({lowMax + 1} to {mediumMax})</label>
              <span style={{ fontWeight: 800, color: "#f59e0b" }}>{mediumMax}</span>
            </div>
            <input
              type="range"
              min={lowMax + 5}
              max="90"
              value={mediumMax}
              onChange={(e) => setMediumMax(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#f59e0b", cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
              Transactions scored {lowMax + 1}–{mediumMax} trigger <strong>WARN / VERIFY</strong>.
            </span>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ef4444", marginBottom: "4px" }}>
              High Risk Range: {mediumMax + 1} – 100
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Transactions above {mediumMax} trigger <strong>HOLD / REVIEW</strong>.
            </div>
          </div>
        </div>

        {/* Live Simulation Preview */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#06b6d4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            Live Policy Simulation
          </h2>

          {simData && (
            <div>
              <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
                {simData.simulation.map((item) => (
                  <div
                    key={item.risk_score}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-glass)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                        Score {item.risk_score}
                      </span>
                      <span className={`risk-badge ${item.risk_level.toLowerCase()}`} style={{ marginLeft: "10px" }}>
                        {item.risk_level}
                      </span>
                    </div>
                    <span className={`action-badge ${item.action.toLowerCase()}`} style={{ fontSize: "0.78rem" }}>
                      Action: {item.action}
                    </span>
                  </div>
                ))}
              </div>

              {/* JSON Snippet */}
              <div style={{ marginTop: "16px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
                  SDK Policy Config JSON
                </div>
                <pre
                  style={{
                    background: "rgba(6,8,15,0.9)",
                    padding: "12px",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    color: "#a5b4fc",
                    fontFamily: "monospace",
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify({ thresholds: { low_max: lowMax, medium_max: mediumMax } }, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
