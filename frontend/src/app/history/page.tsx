"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { AnalysisResponse } from "@/lib/api";

interface StoredTransaction extends AnalysisResponse {
  blockchain_tx_hash?: string;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("fraudshield_history");
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  const filtered = transactions.filter((t) => {
    const matchesFilter = filter === "all" || t.risk_level.toLowerCase() === filter;
    const matchesSearch =
      searchQuery === "" ||
      t.tx_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sender_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recipient_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.blockchain_tx_hash && t.blockchain_tx_hash.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const sortedTxs = [...filtered].reverse();

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all history records?")) {
      localStorage.removeItem("fraudshield_history");
      setTransactions([]);
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["TX_ID", "Sender", "Recipient", "Amount_ETH", "Risk_Score", "Risk_Level", "Action", "Blockchain_Hash", "Timestamp"];
    const rows = transactions.map((t) => [
      t.tx_id,
      t.sender_address,
      t.recipient_address,
      t.amount,
      t.risk_score,
      t.risk_level,
      t.action,
      t.blockchain_tx_hash || "",
      new Date(t.timestamp * 1000).toISOString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fraudshield_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Transaction History Log</h1>
            <p>Comprehensive audit log of all analyzed transactions & on-chain records</p>
          </div>
          {transactions.length > 0 && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={exportCSV}
                className="btn btn-secondary"
                style={{ fontSize: "0.78rem", padding: "8px 14px" }}
              >
                📥 Export CSV
              </button>
              <button
                onClick={clearHistory}
                className="btn btn-secondary"
                style={{ fontSize: "0.78rem", padding: "8px 14px", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                🗑️ Clear Log
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar: Search + Risk Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        {/* Search */}
        <div style={{ position: "relative", width: "320px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by TX ID or Address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "38px", fontSize: "0.84rem" }}
          />
          <svg
            width="16" height="16" viewBox="0 0 20 20" fill="var(--text-muted)"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Filter buttons */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { value: "all", label: "All", count: transactions.length },
            { value: "low", label: "Low Risk", count: transactions.filter((t) => t.risk_level === "Low").length },
            { value: "medium", label: "Medium Risk", count: transactions.filter((t) => t.risk_level === "Medium").length },
            { value: "high", label: "High Risk", count: transactions.filter((t) => t.risk_level === "High").length },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`btn ${filter === f.value ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "7px 14px", fontSize: "0.78rem" }}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: "4px" }}>
        {sortedTxs.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>No transaction records found</h3>
            <p>
              {searchQuery || filter !== "all"
                ? "No transactions match your current search criteria."
                : "Analyze a transaction on the Analyzer page to see it logged here."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
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
                  <th>On-Chain Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {sortedTxs.map((tx, i) => (
                  <motion.tr
                    key={tx.tx_id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#a5b4fc", fontWeight: 600 }}>
                      {tx.tx_id}
                    </td>
                    <td>
                      <span className="address address-short" title={tx.sender_address}>
                        {tx.sender_address.slice(0, 6)}...{tx.sender_address.slice(-4)}
                      </span>
                    </td>
                    <td>
                      <span className="address address-short" title={tx.recipient_address}>
                        {tx.recipient_address.slice(0, 6)}...{tx.recipient_address.slice(-4)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{tx.amount} ETH</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color:
                            tx.risk_score <= 30
                              ? "#10b981"
                              : tx.risk_score <= 70
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      >
                        {tx.risk_score}%
                      </span>
                    </td>
                    <td>
                      <span className={`risk-badge ${tx.risk_level.toLowerCase()}`}>
                        {tx.risk_level}
                      </span>
                    </td>
                    <td>
                      <span className={`action-badge ${tx.action.toLowerCase()}`}>
                        {tx.action}
                      </span>
                    </td>
                    <td>
                      {tx.blockchain_tx_hash ? (
                        <span
                          title={tx.blockchain_tx_hash}
                          style={{
                            color: "#10b981",
                            fontSize: "0.72rem",
                            fontFamily: "monospace",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          ✅ {tx.blockchain_tx_hash.slice(0, 10)}...
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                          Unrecorded
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                      {new Date(tx.timestamp * 1000).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
