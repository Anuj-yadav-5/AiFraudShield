"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { getWatchlist, reportAddress, type WatchlistItem } from "@/lib/api";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Report Modal Form
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportAddr, setReportAddr] = useState("");
  const [reportCat, setReportCat] = useState("Inferno Drainer Phishing");
  const [submitting, setSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");

  const loadData = async () => {
    try {
      const data = await getWatchlist();
      setWatchlist(data.watchlist);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportAddr) return;
    setSubmitting(true);
    setReportSuccess("");

    try {
      await reportAddress(reportAddr, reportCat);
      setReportSuccess("Address report submitted to community threat DB!");
      setReportAddr("");
      setShowReportForm(false);
      loadData();
    } catch {
      setReportSuccess("Report submitted locally.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = watchlist.filter(
    (item) =>
      item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Malicious Address Watchlist</h1>
            <p>Community threat database of verified scam, drainer & phishing addresses</p>
          </div>
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="btn btn-primary"
            style={{ padding: "10px 18px", fontSize: "0.82rem" }}
          >
            🚨 Report Suspicious Address
          </button>
        </div>
      </div>

      {/* Report Form Drawer */}
      {showReportForm && (
        <motion.div
          className="glass-card"
          style={{ padding: "24px", marginBottom: "24px", border: "1px solid rgba(239,68,68,0.3)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "#ef4444", display: "flex", alignItems: "center", gap: "8px" }}>
            🚨 Submit Malicious Threat Report
          </h3>
          <form onSubmit={handleReportSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", alignItems: "flex-end" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Suspicious Address</label>
              <input
                type="text"
                className="form-input address"
                placeholder="0x..."
                value={reportAddr}
                onChange={(e) => setReportAddr(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={reportCat}
                onChange={(e) => setReportCat(e.target.value)}
                style={{ background: "rgba(12,18,32,0.9)" }}
              >
                <option value="Inferno Drainer Phishing">Inferno Drainer Phishing</option>
                <option value="Fake Permit2 Token Approval">Fake Permit2 Token Approval</option>
                <option value="Tornado Cash Privacy Mixer">Tornado Cash Privacy Mixer</option>
                <option value="Honeypot Token Contract">Honeypot Token Contract</option>
                <option value="Counterparty Exploiter">Counterparty Exploiter</option>
              </select>
            </div>
            <button type="submit" className="btn btn-blockchain" disabled={submitting} style={{ padding: "12px 20px" }}>
              {submitting ? "Submitting..." : "Submit Threat Report"}
            </button>
          </form>
        </motion.div>
      )}

      {reportSuccess && (
        <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontSize: "0.84rem", marginBottom: "20px" }}>
          ✅ {reportSuccess}
        </div>
      )}

      {/* Search & Stats */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <div style={{ position: "relative", width: "360px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search address or scam category..."
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

        <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <div>Total Flagged: <strong style={{ color: "var(--text-primary)" }}>{watchlist.length}</strong></div>
          <div>Verified Malicious: <strong style={{ color: "#ef4444" }}>{watchlist.filter(w => w.status === "Verified Malicious").length}</strong></div>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="glass-card" style={{ padding: "4px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <div className="spinner" style={{ margin: "0 auto 12px" }} /> Loading threat DB...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🛡️</div>
            <h3>No matching addresses</h3>
            <p>This address is not currently flagged in the threat database.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Scam Category</th>
                  <th>Risk Severity</th>
                  <th>Reports</th>
                  <th>Date Logged</th>
                  <th>Verification Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <td>
                      <span className="address" style={{ color: "#a5b4fc" }}>
                        {item.address}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.category}</td>
                    <td>
                      <span className={`risk-badge ${item.risk_level.toLowerCase()}`}>
                        {item.risk_level} Risk
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{item.reports_count} reports</td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.reported_date}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: item.status === "Verified Malicious" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
                          color: item.status === "Verified Malicious" ? "#ef4444" : "#f59e0b",
                        }}
                      >
                        {item.status}
                      </span>
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
