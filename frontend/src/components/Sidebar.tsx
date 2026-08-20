"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavGroup {
  category: string;
  items: {
    href: string;
    label: string;
    badge?: string;
    icon: React.ReactNode;
  }[];
}

const navGroups: NavGroup[] = [
  {
    category: "PLATFORM",
    items: [
      {
        href: "/",
        label: "Home Overview",
        icon: (
          <svg className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        ),
      },
    ],
  },
  {
    category: "THREAT INTELLIGENCE",
    items: [
      {
        href: "/dashboard",
        label: "Analytics Dashboard",
        icon: (
          <svg className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        ),
      },
      {
        href: "/analyze",
        label: "Risk Analyzer",
        badge: "AI SCAN",
        icon: (
          <svg className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/watchlist",
        label: "Malicious Watchlist",
        badge: "NEW",
        icon: (
          <svg className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
  {
    category: "ENTERPRISE & ENGINE",
    items: [
      {
        href: "/batch-scanner",
        label: "Multi-Tx Batch Scanner",
        badge: "NEW",
        icon: (
          <svg className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/policy-simulator",
        label: "Policy Threshold Simulator",
        badge: "NEW",
        icon: (
          <svg className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/history",
        label: "Audit History Log",
        icon: (
          <svg className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <div className="sidebar-logo" style={{ cursor: "pointer", position: "relative" }}>
          <div style={{ position: "relative", width: "44px", height: "44px", borderRadius: "12px", overflow: "hidden", border: "1.5px solid rgba(99, 102, 241, 0.4)", boxShadow: "0 4px 16px rgba(99, 102, 241, 0.25)" }}>
            <Image
              src="/logo.jpg"
              alt="AI FraudShield Logo"
              fill
              sizes="44px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h1 style={{ fontSize: "1.2rem", fontWeight: 900 }}>FraudShield</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              <span style={{ fontSize: "0.65rem", color: "#a5b4fc", fontWeight: 700, letterSpacing: "0.05em" }}>
                AI THREAT PROTECTION
              </span>
              <span style={{ fontSize: "0.6rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "1px 5px", borderRadius: "4px", fontWeight: 800 }}>
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Quick Action Button */}
      <div style={{ padding: "0 4px 14px" }}>
        <Link href="/analyze" className="btn btn-primary" style={{ width: "100%", padding: "10px 16px", fontSize: "0.8rem", textDecoration: "none", borderRadius: "10px", justifyContent: "flex-start", gap: "10px" }}>
          <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
            🔍
          </div>
          Scan New Transaction
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <div className="nav-section-label" style={{ marginTop: 0 }}>{group.category}</div>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  {item.icon}
                  <span style={{ flex: 1, fontSize: "0.84rem" }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize: "0.58rem", fontWeight: 800, background: item.badge === "NEW" ? "rgba(6,182,212,0.15)" : "linear-gradient(135deg, #06b6d4, #3b82f6)", color: item.badge === "NEW" ? "#06b6d4" : "white", border: item.badge === "NEW" ? "1px solid rgba(6,182,212,0.3)" : "none", padding: "2px 6px", borderRadius: "6px" }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* System Health Card */}
      <div style={{ marginTop: "auto", padding: "12px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>System Status</span>
          <span style={{ color: "#10b981", fontSize: "0.65rem" }}>● Operational</span>
        </div>

        <div style={{ display: "grid", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>AI Engine</span>
            <span style={{ color: "#a5b4fc", fontWeight: 600 }}>Random Forest</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Smart Contract</span>
            <span style={{ color: "#06b6d4", fontWeight: 600 }}>FraudShield.sol</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Node RPC</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>Hardhat :8545</span>
          </div>
        </div>
      </div>

      {/* Footer Version */}
      <div style={{ padding: "8px 4px 0", textAlign: "center" }}>
        <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>FraudShield v1.1.0 • Web3 Threat Protection</span>
      </div>
    </aside>
  );
}
