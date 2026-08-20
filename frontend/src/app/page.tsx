"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HomePage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      {/* Hero Section */}
      <motion.div className="hero-banner" variants={fadeUp} style={{ padding: "48px 40px", marginBottom: "36px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "36px", alignItems: "center" }}>
          <div>
            {/* Brand Pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", padding: "6px 14px", borderRadius: "20px", marginBottom: "20px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1" }} className="pulse-glow" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                AI-Powered Web3 Security Platform
              </span>
            </div>

            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, lineHeight: 1.15, marginBottom: "16px", letterSpacing: "-0.03em", background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI FraudShield
            </h1>

            <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#06b6d4", marginBottom: "16px", letterSpacing: "-0.01em" }}>
              Detect. Explain. Prevent. Verify.
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.65, marginBottom: "28px" }}>
              An AI-powered decentralized fraud detection and prevention system designed to evaluate cryptocurrency transactions before finality. Combining machine learning risk scoring (0–100), explainable factor analysis, and verifiable smart contract audit trails.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link href="/analyze" className="btn btn-primary" style={{ padding: "14px 28px", textDecoration: "none", fontSize: "0.92rem" }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Launch Risk Analyzer
              </Link>
              <Link href="/dashboard" className="btn btn-secondary" style={{ padding: "14px 28px", textDecoration: "none", fontSize: "0.92rem" }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                View Analytics Dashboard
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }}>
            <Image
              src="/hero.jpg"
              alt="AI FraudShield Security Visual"
              width={600}
              height={338}
              style={{ width: "100%", height: "auto", display: "block" }}
              priority
            />
          </div>
        </div>
      </motion.div>

      {/* Abstract & Problem Statement */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "36px" }}>
        <motion.div className="glass-card" style={{ padding: "32px" }} variants={fadeUp}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "12px" }}>
            The Web3 Fraud Problem
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "14px" }}>
            Blockchain transactions are fast and fundamentally irreversible. Once a user approves a transaction to a fraudulent wallet, recovering lost funds is virtually impossible.
          </p>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
            Traditional security approaches rely on static blacklists, post-transaction forensic analysis, or centralized manual databases — failing to protect users <em>before</em> funds are sent.
          </div>
        </motion.div>

        <motion.div className="glass-card" style={{ padding: "32px" }} variants={fadeUp}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(16,185,129,0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>
            🛡️
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "12px" }}>
            The FraudShield Solution
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "14px" }}>
            FraudShield introduces a proactive AI-driven security layer between the user transaction request and blockchain execution.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "0.75rem", fontWeight: 700 }}>
            {["User Request", "→", "AI Risk Score", "→", "Explainable Factors", "→", "Policy Engine", "→", "Smart Contract Audit"].map((step, idx) => (
              <span key={idx} style={{ color: step === "→" ? "var(--text-muted)" : "#a5b4fc", background: step !== "→" ? "rgba(99,102,241,0.1)" : "transparent", padding: step !== "→" ? "4px 10px" : "0", borderRadius: "6px" }}>
                {step}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Core Technology Pillars */}
      <motion.div style={{ marginBottom: "36px" }} variants={fadeUp}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>
            Hybrid Off-Chain AI + On-Chain Security
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
            AI inference occurs off-chain for lightning-fast computation, while smart contracts provide verifiable security policies and tamper-resistant audit logs.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* AI Machine Learning Pillar */}
          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px" }}>
              <Image
                src="/ai_engine.jpg"
                alt="Machine Learning Fraud Risk Model"
                width={500}
                height={281}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "8px" }}>
              1. ML Fraud Engine & Explainability (XAI)
            </h3>
            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>
              Trained on behavioral features like wallet age, transaction frequency, average values, recipient novelty, and suspicious counterparty interactions using a Random Forest classifier.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.78rem" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                <strong style={{ color: "#a5b4fc" }}>Risk Score (0–100)</strong><br />Converts fraud probability into intuitive score.
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                <strong style={{ color: "#06b6d4" }}>Explainable Factors</strong><br />Shows exact feature point contributions.
              </div>
            </div>
          </div>

          {/* Blockchain Audit Trail Pillar */}
          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px" }}>
              <Image
                src="/blockchain_audit.jpg"
                alt="Decentralized Smart Contract Audit Trail"
                width={500}
                height={281}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "8px" }}>
              2. Programmable On-Chain Audit Log
            </h3>
            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>
              Uses EVM Solidity smart contract <code style={{ color: "#a5b4fc" }}>FraudShield.sol</code> to emit <code style={{ color: "#10b981" }}>RiskAssessmentRecorded</code> events and anchor decisions without holding user funds.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.78rem" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                <strong style={{ color: "#10b981" }}>Non-Custodial</strong><br />Does not hold or control user crypto.
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                <strong style={{ color: "#f59e0b" }}>Verifiable Audit</strong><br />Immutable transaction hash verification.
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Risk Policy Matrix */}
      <motion.div className="glass-card" style={{ padding: "32px", marginBottom: "36px" }} variants={fadeUp}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "6px" }}>
          Configurable Risk Policy Engine
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
          Based on the calculated risk score, FraudShield applies predefined security policies:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div style={{ padding: "20px", borderRadius: "14px", background: "var(--risk-low-bg)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              Low Risk Policy
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "4px" }}>0 – 30</div>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#10b981", marginBottom: "8px" }}>Action: ALLOW</div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Transaction shows normal wallet behavior. Proceed without warning.</p>
          </div>

          <div style={{ padding: "20px", borderRadius: "14px", background: "var(--risk-medium-bg)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              Medium Risk Policy
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "4px" }}>31 – 70</div>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#f59e0b", marginBottom: "8px" }}>Action: WARN / VERIFY</div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Suspicious indicators detected (e.g., new recipient or high amount). Prompt user verification.</p>
          </div>

          <div style={{ padding: "20px", borderRadius: "14px", background: "var(--risk-high-bg)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              High Risk Policy
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "4px" }}>71 – 100</div>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#ef4444", marginBottom: "8px" }}>Action: HOLD / REVIEW</div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Highly anomalous pattern (recently created wallet + rapid transactions). Hold transaction for review.</p>
          </div>
        </div>
      </motion.div>

      {/* Target Users & API Monetization */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "36px" }}>
        <motion.div className="glass-card" style={{ padding: "28px" }} variants={fadeUp}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#6366f1"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.005 3.005 0 013.75-2.906z" /></svg>
            Target Customers & Integration
          </h3>
          <div style={{ display: "grid", gap: "10px" }}>
            {[
              ["Crypto Wallet Providers", "Integrate FraudShield SDK to warn users before signing risky transactions."],
              ["Crypto Exchanges", "Assess withdrawal requests and flag suspicious addresses in real time."],
              ["DeFi Protocols & DApps", "Monitor incoming wallet interactions for malicious exploit patterns."],
              ["Payment Gateways & APIs", "Use FraudShield REST API to evaluate automated checkout risks."],
              ["Security & Compliance Teams", "Investigate flagged wallets with explainable factor reports."],
            ].map(([title, desc], idx) => (
              <div key={idx} style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)" }}>
                <strong style={{ fontSize: "0.82rem", color: "#a5b4fc" }}>{title}</strong>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="glass-card" style={{ padding: "28px" }} variants={fadeUp}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#06b6d4"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm15 8.586a1.5 1.5 0 01-1.06.44H2.06A1.5 1.5 0 011 11.586V15a2 2 0 002 2h14a2 2 0 002-2v-3.414z" clipRule="evenodd" /></svg>
            B2B Business & Revenue Model
          </h3>
          <div style={{ display: "grid", gap: "12px" }}>
            {[
              ["API Subscription Tiers", "Monthly SaaS plans for wallets and protocols scaling with transaction volume."],
              ["Usage-Based Pricing", "Pay-per-scan API micro-billing for enterprise risk checks."],
              ["Web3 SDK Integration", "Plug-and-play npm/React package for instant dApp transaction protection."],
              ["Premium Wallet Intelligence", "Advanced counterparty graph analysis and enterprise threat feeds."],
            ].map(([title, desc], idx) => (
              <div key={idx} style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)" }}>
                <strong style={{ fontSize: "0.84rem", color: "#06b6d4" }}>{title}</strong>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "3px" }}>{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Call to Action Footer */}
      <motion.div className="glass-card" style={{ padding: "36px", textAlign: "center", background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))" }} variants={fadeUp}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
          Ready to Test AI Fraud Detection?
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto 24px" }}>
          Analyze transaction risk scores, view explainable factors, and record security assessments on the local testnet.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
          <Link href="/analyze" className="btn btn-primary" style={{ padding: "12px 28px", textDecoration: "none" }}>
            🔍 Go to Risk Analyzer
          </Link>
          <Link href="/dashboard" className="btn btn-secondary" style={{ padding: "12px 28px", textDecoration: "none" }}>
            📊 Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
