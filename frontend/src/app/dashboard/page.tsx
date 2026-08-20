"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import type { AnalysisResponse } from "@/lib/api";

interface StoredTransaction extends AnalysisResponse {
  blockchain_tx_hash?: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 1200;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count}{suffix}</>;
}

// Donut chart component
function DonutChart({ data, size = 160 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut-chart" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const pct = total > 0 ? d.value / total : 0;
          const dashLength = pct * circumference;
          const currentOffset = offset;
          offset += dashLength;
          return (
            <motion.circle
              key={i}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" strokeWidth="14" strokeLinecap="round"
              stroke={d.color}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-currentOffset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center", filter: `drop-shadow(0 0 4px ${d.color}40)` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }}
            />
          );
        })}
        {total === 0 && (
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="14" stroke="rgba(255,255,255,0.04)" />
        )}
      </svg>
      <div className="donut-center">
        <div style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.04em" }}>
          {total > 0 ? <AnimatedCounter value={total} /> : 0}
        </div>
        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Total
        </div>
      </div>
    </div>
  );
}

// Mini bar chart
function MiniBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 60}px` }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
            style={{
              width: "100%",
              borderRadius: "4px 4px 2px 2px",
              background: `linear-gradient(180deg, ${d.color}, ${d.color}60)`,
              minHeight: d.value > 0 ? "4px" : "0px",
            }}
          />
          <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 600 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [stats, setStats] = useState({ total: 0, suspicious: 0, held: 0, avgScore: 0, onChain: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("fraudshield_history");
    if (stored) {
      const txs: StoredTransaction[] = JSON.parse(stored);
      setTransactions(txs);
      const total = txs.length;
      const suspicious = txs.filter((t) => t.risk_level === "Medium" || t.risk_level === "High").length;
      const held = txs.filter((t) => t.action === "Hold").length;
      const avgScore = total > 0 ? Math.round(txs.reduce((s, t) => s + t.risk_score, 0) / total) : 0;
      const onChain = txs.filter((t) => t.blockchain_tx_hash).length;
      setStats({ total, suspicious, held, avgScore, onChain });
    }
  }, []);

  const lowRisk = transactions.filter(t => t.risk_level === "Low").length;
  const medRisk = transactions.filter(t => t.risk_level === "Medium").length;
  const highRisk = transactions.filter(t => t.risk_level === "High").length;
  const recentTxs = transactions.slice(-6).reverse();

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      {/* Header */}
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Real-time security analytics, risk scores distribution, and action metrics</p>
      </div>

      {/* Stats Grid */}
      <motion.div className="stats-grid" variants={fadeUp}>
        {[
          { label: "Transactions Scanned", value: stats.total, icon: "🔍", barColor: "#6366f1", barPct: Math.min(stats.total * 10, 100), trend: stats.total > 0 ? "Active" : null },
          { label: "Suspicious Flagged", value: stats.suspicious, icon: "⚠️", barColor: "#f59e0b", barPct: stats.total > 0 ? (stats.suspicious / stats.total) * 100 : 0, trend: null },
          { label: "Transactions Held", value: stats.held, icon: "🛑", barColor: "#ef4444", barPct: stats.total > 0 ? (stats.held / stats.total) * 100 : 0, trend: null },
          { label: "Avg Risk Score", value: stats.avgScore, icon: "📊", barColor: stats.avgScore <= 30 ? "#10b981" : stats.avgScore <= 70 ? "#f59e0b" : "#ef4444", barPct: stats.avgScore, trend: null },
        ].map((stat, i) => (
          <motion.div key={i} className="glass-card stat-card" variants={fadeUp}>
            <div className="stat-icon-bg" style={{ background: stat.barColor }}>{stat.icon}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.barColor }}>
              <AnimatedCounter value={stat.value} suffix={i === 3 ? "%" : ""} />
            </div>
            {stat.trend && <span className="stat-trend up">● {stat.trend}</span>}
            <div className="stat-bar">
              <motion.div
                className="stat-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${stat.barPct}%` }}
                transition={{ delay: 0.8, duration: 1.2 }}
                style={{ background: stat.barColor }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px", marginBottom: "28px" }}>
        {/* Risk Distribution Donut */}
        <motion.div className="glass-card" style={{ padding: "24px" }} variants={fadeUp}>
          <h3 style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="#8b5cf6"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
            Risk Distribution
          </h3>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <DonutChart data={[
              { label: "Low", value: lowRisk, color: "#10b981" },
              { label: "Medium", value: medRisk, color: "#f59e0b" },
              { label: "High", value: highRisk, color: "#ef4444" },
            ]} />
            <div style={{ display: "flex", gap: "16px" }}>
              {[
                { label: "Low", color: "#10b981", value: lowRisk },
                { label: "Medium", color: "#f59e0b", value: medRisk },
                { label: "High", color: "#ef4444", value: highRisk },
              ].map((l, i) => (
                <div key={i} className="legend-item">
                  <div className="legend-dot" style={{ background: l.color }} />
                  {l.label} ({l.value})
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Action Breakdown */}
        <motion.div className="glass-card" style={{ padding: "24px" }} variants={fadeUp}>
          <h3 style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="#6366f1"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
            Action Policy Breakdown
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Allow", value: transactions.filter(t => t.action === "Allow").length, color: "#10b981", icon: "✓" },
              { label: "Warn", value: transactions.filter(t => t.action === "Warn").length, color: "#f59e0b", icon: "!" },
              { label: "Hold", value: transactions.filter(t => t.action === "Hold").length, color: "#ef4444", icon: "✕" },
            ].map((item, i) => {
              const pct = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: `${item.color}15`, color: item.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800 }}>{item.icon}</span>
                      {item.label}
                    </span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: item.color }}>{item.value} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 1 + i * 0.15, duration: 0.8 }}
                      style={{ height: "100%", borderRadius: "3px", background: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "20px" }}>
            <MiniBarChart data={[
              { label: "Allow", value: transactions.filter(t => t.action === "Allow").length, color: "#10b981" },
              { label: "Warn", value: transactions.filter(t => t.action === "Warn").length, color: "#f59e0b" },
              { label: "Hold", value: transactions.filter(t => t.action === "Hold").length, color: "#ef4444" },
            ]} />
          </div>
        </motion.div>

        {/* Step-by-Step Flow */}
        <motion.div className="glass-card" style={{ padding: "24px" }} variants={fadeUp}>
          <h3 style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="#06b6d4"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            Execution Pipeline
          </h3>
          {[
            { icon: "📝", title: "1. Submit Tx", desc: "User inputs addresses & ETH amount", bg: "rgba(99,102,241,0.08)" },
            { icon: "⚙️", title: "2. Extract Features", desc: "Derive wallet age & frequency", bg: "rgba(6,182,212,0.08)" },
            { icon: "🤖", title: "3. ML Inference", desc: "Random Forest scores risk 0-100", bg: "rgba(139,92,246,0.08)" },
            { icon: "📊", title: "4. Explain Factors", desc: "Calculate feature contributions", bg: "rgba(245,158,11,0.08)" },
            { icon: "🔗", title: "5. Record On-Chain", desc: "Smart contract logs decision", bg: "rgba(16,185,129,0.08)" },
          ].map((step, i) => (
            <motion.div
              key={i}
              className="flow-step"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.12 }}
            >
              <div className="flow-step-icon" style={{ background: step.bg, fontSize: "1rem" }}>{step.icon}</div>
              <div className="flow-step-content">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recent Transactions Table Preview */}
      <motion.div className="glass-card" style={{ padding: "24px" }} variants={fadeUp}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "0.88rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="#6366f1"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" /></svg>
            Recent Scans
          </h3>
          {recentTxs.length > 0 && (
            <Link href="/history" style={{ fontSize: "0.78rem", color: "#a5b4fc", textDecoration: "none", fontWeight: 600 }}>
              View All History →
            </Link>
          )}
        </div>

        {recentTxs.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No transactions analyzed yet</h3>
            <p>Head to the Analyzer to scan your first transaction</p>
            <Link href="/analyze" className="btn btn-primary" style={{ marginTop: "16px", textDecoration: "none", display: "inline-flex" }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
              Analyze Transaction
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>TX ID</th>
                <th>Sender</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Risk Score</th>
                <th>Level</th>
                <th>Action</th>
                <th>On-Chain</th>
              </tr>
            </thead>
            <tbody>
              {recentTxs.map((tx, i) => (
                <motion.tr
                  key={tx.tx_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                  <td style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#a5b4fc" }}>{tx.tx_id}</td>
                  <td><span className="address address-short">{tx.sender_address.slice(0, 6)}...{tx.sender_address.slice(-4)}</span></td>
                  <td><span className="address address-short">{tx.recipient_address.slice(0, 6)}...{tx.recipient_address.slice(-4)}</span></td>
                  <td style={{ fontWeight: 600 }}>{tx.amount} ETH</td>
                  <td>
                    <span style={{ fontWeight: 800, color: tx.risk_score <= 30 ? "#10b981" : tx.risk_score <= 70 ? "#f59e0b" : "#ef4444" }}>
                      {tx.risk_score}%
                    </span>
                  </td>
                  <td><span className={`risk-badge ${tx.risk_level.toLowerCase()}`}>{tx.risk_level}</span></td>
                  <td><span className={`action-badge ${tx.action.toLowerCase()}`}>{tx.action}</span></td>
                  <td>
                    {tx.blockchain_tx_hash
                      ? <span style={{ color: "#10b981", fontSize: "0.72rem" }}>✅</span>
                      : <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>—</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  );
}
