# RecallGuard MCP Server (`recallguard-mcp`)

Model Context Protocol (MCP) server providing deterministic product recall screening against **46,642 verified US & Canadian government recall records** (`1,508` CPSC + `10,922` FDA + `34,212` Health Canada/CFIA/Transport Canada) with native `x402 v2` micropayment settlement on Base Mainnet (`USDC`).

![Status: Live Production](https://img.shields.io/badge/status-live_production-10b981)
![Smithery: Grade A Certified](https://img.shields.io/badge/Smithery-Grade_A_Certified-6366f1)
![x402 Rail: Base Mainnet USDC](https://img.shields.io/badge/x402_Base_USDC-1_self--test_settled-3b82f6)
![Outside Paying Customers: 0](https://img.shields.io/badge/outside_paying_customers-0-f59e0b)
![License: MIT](https://img.shields.io/badge/license-MIT-64748b)

---

## 1. Install & Run Today

```bash
npx recallguard-mcp
# or install globally / locally
npm install recallguard-mcp
```

### Add to Claude Desktop / Cursor (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "recallguard": {
      "command": "npx",
      "args": ["-y", "recallguard-mcp"],
      "env": {
        "RECALLGUARD_BASE": "https://recallguard-api.vercel.app",
        "X402_PAY_TO": "0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01"
      }
    }
  }
}
```

---

## 2. Machine-Readable Discovery Links

- **Canonical LLM Index (`llms.txt`):** [`https://www.nanoempireai.com/llms.txt`](https://www.nanoempireai.com/llms.txt)
- **Live MCP Discovery Manifest:** [`https://www.nanoempireai.com/.well-known/mcp.json`](https://www.nanoempireai.com/.well-known/mcp.json)
- **A2A Agent Card (`v1.5.0`):** [`https://www.nanoempireai.com/.well-known/agent-card.json`](https://www.nanoempireai.com/.well-known/agent-card.json)
- **Poppy / PAP Manifest (`PAP/1.0`):** [`https://www.nanoempireai.com/.well-known/poppy.json`](https://www.nanoempireai.com/.well-known/poppy.json)
- **Commercial Offers (`offers.json`):** [`https://www.nanoempireai.com/offers.json`](https://www.nanoempireai.com/offers.json)
- **OpenAPI 3.1 Spec:** [`https://www.nanoempireai.com/.well-known/openapi.json`](https://www.nanoempireai.com/.well-known/openapi.json)
- **Smithery Registry:** [`https://smithery.ai/servers/rob-c8hu/recallguard-mcp`](https://smithery.ai/servers/rob-c8hu/recallguard-mcp)

---

## 3. Exposed MCP Tools & Pricing (`x402 v2` Base USDC + Stripe)

- **Settlement Network:** Base Mainnet (`eip155:8453`)
- **Asset:** USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Pay-To Treasury:** `0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01`

| Tool | Underlying Endpoint | Price | Description |
|------|---------------------|-------|-------------|
| **`health`** | `GET /api/v1/health` | **Free** | Verifies API status, dataset build timestamp (`2026-10-11T17:17:54Z`), and record count (`46,642`) |
| **`feed`** | `GET /api/v1/feed` | **$0.05 USDC** (`50000` atomic) | Returns latest CPSC/FDA/Health Canada recall feed with date and limit filters |
| **`match`** | `POST /api/v1/match` | **$0.10 USDC** (`100000` atomic) | Screens an array of inventory items (`name`, `brand`, `upc`, `sku`) against `46,642` recalls |

- **Human / Enterprise Checkout (Stripe):** Single SKU Audit (**$30**) or Continuous Watchlist Pro (**$99/mo**) via [`offers.json`](https://www.nanoempireai.com/offers.json).

---

## 4. Settlement Proof & Honest Volume Ledger

- **On-Chain Settlement Proof (Base Mainnet Block `51961194`):**
  - **Tx Hash:** [`0x0581b819b2e5b481cbbcfb8fe81e6fe57a0d0ef9c6f8fc04952164761586da64`](https://basescan.org/tx/0x0581b819b2e5b481cbbcfb8fe81e6fe57a0d0ef9c6f8fc04952164761586da64)
  - **Amount:** `0.05 USDC` (`50,000` atomic units) settled via EIP-3009 `TransferWithAuthorization` for `GET /api/v1/feed`.
- **Epistemic Volume Disclosure:**
  - **Self-test on-chain settlements:** `1` (`$0.05 USDC`)
  - **Outside paying customers:** `0`
  - **Outside settled volume:** `$0.00`

---

## 5. Development

```bash
npm install
npm run build
npm test
```

---

## 6. License & Contact

- **License:** MIT
- **Contact:** Robert Lambert (`rob@nanoempireai.com`) · [`https://www.nanoempireai.com`](https://www.nanoempireai.com)
