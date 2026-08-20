<div align="center">

# 🛡️ AI FraudShield

### AI-Powered Decentralized Fraud Detection for Web3 Transactions

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-RandomForest-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-EVM-yellow?style=for-the-badge)](https://hardhat.org/)

**Detect. Explain. Prevent. Verify.**

*A proactive AI-driven security layer between the user and blockchain execution — scoring transactions before funds are ever sent.*

</div>

---

## 📖 Overview

Blockchain transactions are **fast and fundamentally irreversible**. Once funds reach a fraudulent wallet, recovery is virtually impossible. Traditional security tools rely on post-transaction forensics or static blacklists — they protect **after the damage is done**.

**AI FraudShield** flips the model. It introduces a proactive security gate **before** a transaction reaches the chain:

```
User Request → AI Risk Score → Explainable Factors → Policy Engine → Smart Contract Audit
```

The system combines:
- 🤖 **Off-chain ML inference** — fast, explainable Random Forest fraud scoring (0–100)
- ⛓️ **On-chain audit log** — `FraudShield.sol` records immutable risk assessments via EVM events
- 🧠 **Configurable policy engine** — dApps can define their own Low/Medium/High thresholds
- 🔍 **Community threat watchlist** — live database of phishing, drainer, and mixer addresses

---

## 🚀 Features

| Feature | Description |
|---|---|
| **🔬 Single Transaction Analyzer** | Analyze any transaction for risk with a 0–100 score, fraud probability, and per-factor explanations |
| **📦 Batch Scanner** | Submit multiple transactions at once for institutional/exchange compliance checks |
| **🚨 Malicious Address Watchlist** | Browse and search community-verified scam/phishing/drainer addresses |
| **📢 Threat Reporting** | Submit suspicious addresses directly to the community threat DB |
| **⚙️ Policy Simulator** | Configure custom Low/Medium/High threshold boundaries and preview how they reclassify transactions |
| **📊 Analytics Dashboard** | Visualize risk distribution, scan history, and threat trends at a glance |
| **📋 Scan History** | Browse past transaction scans with full result details and audit trails |
| **⛓️ Blockchain Audit Log** | Record risk assessments on-chain via `FraudShield.sol` for tamper-resistant verification |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                     │
│   /analyze  /batch-scanner  /watchlist  /dashboard          │
│   /history  /policy-simulator                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (CORS)
┌──────────────────────▼──────────────────────────────────────┐
│                  Backend (FastAPI + Uvicorn)                 │
│                                                             │
│  ┌───────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │ Feature Engine │→ │  ML Predictor   │→ │ Policy Engine │ │
│  │ (feature_     │  │ (Random Forest  │  │ (risk_score   │ │
│  │  engine.py)   │  │  + XAI factors) │  │  → action)    │ │
│  └───────────────┘  └─────────────────┘  └───────────────┘ │
└──────────────────────────────────────────────────────────────┘
                       │ ethers.js
┌──────────────────────▼──────────────────────────────────────┐
│          Smart Contract (Hardhat + Solidity 0.8.24)         │
│                  FraudShield.sol                            │
│         RiskAssessmentRecorded events on EVM                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 ML Fraud Engine

The core AI model is a **Random Forest Classifier** trained on 10 behavioral features derived from wallet and transaction metadata.

### Features Used

| Feature | Description |
|---|---|
| `transaction_amount` | ETH value being transferred |
| `wallet_age_days` | Age of the recipient wallet in days |
| `transaction_frequency` | Historical transaction count of recipient |
| `unique_recipients` | Number of distinct wallets the sender has interacted with |
| `unique_senders` | Number of distinct wallets that have sent to the recipient |
| `avg_transaction_amount` | Recipient's average historical transaction size |
| `amount_deviation` | How much this transaction deviates from the recipient's average |
| `recipient_is_new` | Binary flag: never-before-seen counterparty pair |
| `rapid_transaction_flag` | Binary flag: high-frequency transaction pattern detected |
| `suspicious_interaction_count` | Count of interactions with known suspicious addresses |

### Risk Score → Policy

| Score Range | Risk Level | Action |
|---|---|---|
| **0 – 30** | 🟢 Low | **ALLOW** — Normal wallet behavior |
| **31 – 70** | 🟡 Medium | **WARN / VERIFY** — Suspicious indicators; prompt user confirmation |
| **71 – 100** | 🔴 High | **HOLD / REVIEW** — Highly anomalous; block for manual review |

### Model Configuration

```python
RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42
)
```

---

## ⛓️ Smart Contract — `FraudShield.sol`

The Solidity contract (`contracts/contracts/FraudShield.sol`) provides an **immutable, non-custodial audit trail**:

- ✅ **Non-custodial** — never holds or controls user funds
- 📡 Emits `RiskAssessmentRecorded` events for every recorded scan
- 🔒 Anchors tx IDs, risk scores, and policy actions on-chain
- 🧪 Deployed on **Hardhat local testnet** (chainId: 31337); Sepolia-ready

---

## 📁 Project Structure

```
AiFraudShield/
├── frontend/                   # Next.js 16 app (TypeScript + Tailwind CSS)
│   └── src/app/
│       ├── page.tsx            # Landing / About page
│       ├── analyze/            # Single transaction risk analyzer
│       ├── batch-scanner/      # Batch transaction analysis
│       ├── dashboard/          # Analytics & risk overview
│       ├── history/            # Past scan records
│       ├── watchlist/          # Malicious address threat database
│       └── policy-simulator/   # Custom threshold configuration
│
├── backend/                    # FastAPI Python server
│   ├── main.py                 # API routes (analyze, batch, watchlist, policy)
│   ├── feature_engine.py       # Behavioral feature extraction
│   ├── policy_engine.py        # Risk score → action mapping
│   └── ml/
│       ├── train_model.py      # Model training script
│       ├── predict.py          # Inference + XAI factor scoring
│       ├── model.pkl           # Trained Random Forest (joblib)
│       └── scaler.pkl          # StandardScaler (joblib)
│
├── contracts/                  # Hardhat EVM project
│   ├── contracts/
│   │   └── FraudShield.sol     # Audit log smart contract
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   ├── test/
│   │   └── FraudShield.test.js # Contract unit tests
│   └── hardhat.config.js
│
└── dataset/
    └── transactions.csv        # ML training dataset
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** 3.10+
- **npm** / **pip**

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AiFraudShield.git
cd AiFraudShield
```

---

### 2. Start the Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> API available at `http://localhost:8000`  
> Interactive Swagger docs: `http://localhost:8000/docs`

---

### 3. Train the ML Model *(first-time only)*

```bash
cd backend
python -m ml.train_model
```

This reads `dataset/transactions.csv`, trains the Random Forest classifier, and saves `ml/model.pkl` and `ml/scaler.pkl`.

---

### 4. Start the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

> App available at `http://localhost:3000`

---

### 5. Deploy Smart Contract *(optional)*

```bash
cd contracts
npm install

# Start local Hardhat node (in a separate terminal)
npx hardhat node

# Deploy FraudShield.sol to local network
npx hardhat run scripts/deploy.js --network localhost

# Run contract tests
npx hardhat test
```

---

## 🔌 API Reference

### `POST /api/analyze`
Analyze a single transaction for fraud risk.

**Request:**
```json
{
  "sender_address": "0xABC...",
  "recipient_address": "0xDEF...",
  "amount": 2.5,
  "sender_wallet_age": 180,
  "recipient_wallet_age": 30
}
```

**Response:**
```json
{
  "tx_id": "FS-A1B2C3D4E5F6",
  "risk_score": 78,
  "risk_level": "High",
  "action": "Hold / Review",
  "fraud_probability": 0.82,
  "risk_factors": [
    { "name": "Wallet Age", "contribution": 24.5, "value": 30 },
    { "name": "Rapid Transaction Pattern", "contribution": 18.2, "value": 1 }
  ]
}
```

---

### `POST /api/batch-analyze`
Analyze multiple transactions in one request. Returns per-transaction results plus aggregate stats (`high_risk_count`, `total_amount_eth`).

---

### `GET /api/watchlist`
Retrieve the community malicious address database.

---

### `POST /api/watchlist/report`
Submit a suspicious address to the community threat DB.

```json
{
  "address": "0x1234...",
  "category": "Inferno Drainer Phishing",
  "description": "Optional notes"
}
```

---

### `POST /api/policy/simulate`
Test custom Low/Medium/High threshold boundaries against sample risk scores.

```json
{
  "low_max": 25,
  "medium_max": 65,
  "sample_risk_scores": [10, 40, 70, 85, 95]
}
```

---

### `GET /api/health`
Service health check — returns version and status.

---

## 🎯 Target Use Cases

| Audience | Integration |
|---|---|
| **Crypto Wallet Providers** | Warn users before signing risky transactions |
| **Crypto Exchanges** | Screen withdrawal requests and flag suspicious addresses |
| **DeFi Protocols & DApps** | Monitor incoming wallet interactions for exploit patterns |
| **Payment Gateways** | Evaluate automated checkout transaction risk via REST API |
| **Security & Compliance Teams** | Investigate flagged wallets with explainable XAI factor reports |

---

## 💼 Business Model

- **API Subscription Tiers** — Monthly SaaS plans scaling with transaction volume
- **Usage-Based Pricing** — Pay-per-scan micro-billing for enterprise risk checks
- **Web3 SDK** — Plug-and-play npm/React package for instant dApp transaction protection
- **Premium Wallet Intelligence** — Advanced counterparty graph analysis and enterprise threat feeds

---

## 🧪 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| **Backend** | Python, FastAPI, Uvicorn, Pydantic v2 |
| **Machine Learning** | scikit-learn (Random Forest), pandas, numpy, joblib |
| **Blockchain** | Solidity 0.8.24, Hardhat, ethers.js v6 |
| **Smart Contract Network** | Hardhat Local (chainId 31337) / Sepolia-ready |

---

## 📄 License

This project is open-source. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ for a safer Web3 ecosystem

**⭐ Star this repo if you find it useful!**

</div> 🛡️

**AI-Powered Decentralized Fraud Detection and Prevention System**

> Detect. Explain. Prevent. Verify.

## Overview

FraudShield is an AI-powered Web3 security platform that identifies potentially fraudulent cryptocurrency transactions before they are finalized. The system analyzes transaction and wallet behavior using a machine-learning model and generates a risk score from 0–100 along with an explanation of the factors contributing to the risk.

## Architecture

```
User → Next.js Dashboard → FastAPI Backend → ML Model → Risk Score + Explanation
                                                              ↓
                                              Smart Contract → Blockchain Audit Trail
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| AI/ML | Scikit-learn, Random Forest, Pandas, NumPy |
| Blockchain | Solidity, Hardhat, EVM-compatible testnet |
| Web3 | ethers.js, MetaMask |

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MetaMask browser extension

### 1. Smart Contracts
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat node  # Start local blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
python ml/train_model.py  # Train the ML model
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Connect MetaMask
- Add Hardhat network: RPC URL `http://127.0.0.1:8545`, Chain ID `31337`
- Import a Hardhat test account using the private key shown in the Hardhat node output

## Risk Scoring

| Score | Risk Level | Action |
|-------|-----------|--------|
| 0–30 | Low | Allow |
| 31–70 | Medium | Warn / Verify |
| 71–100 | High | Hold / Review |

## License

MIT
