# RecallGuard MCP Server

**Machine-to-machine recall screening via x402 on Base**

Production-ready MCP server providing recall screening for CPSC/FDA/NHTSA recalls with x402 micropayment settlement on Base (USDC).

## Features

- **Health Check** — Free endpoint to verify API status and x402 configuration
- **Recall Feed** — Latest CPSC/FDA/NHTSA recalls with date filtering ($0.05 USDC/call)
- **Inventory Matching** — Match inventory items against recall database ($0.10 USDC/call)

## Quickstart

### Installation

```bash
npm install recallguard-mcp
# or
npx recallguard-mcp
```

### Configuration

```bash
# Required environment variables
RECALLGUARD_BASE=https://recallguard-api.vercel.app
X402_PAY_TO=0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01
```

### Usage with MCP Client

```json
{
  "mcpServers": {
    "recallguard": {
      "command": "npx",
      "args": ["recallguard-mcp"],
      "env": {
        "RECALLGUARD_BASE": "https://recallguard-api.vercel.app",
        "X402_PAY_TO": "0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01"
      }
    }
  }
}
```

## Available Tools

### `health` (Free)
Check API health and x402 configuration.

```json
{
  "name": "health",
  "arguments": {}
}
```

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-10-08T15:00:00.000Z",
  "x402_configured": true
}
```

### `feed` ($0.05 USDC/call via x402)

Get recall feed with optional date filter and limit.

```json
{
  "name": "feed",
  "arguments": {
    "since": "2026-01-01",
    "limit": 50
  }
}
```

**Response:**
```json
{
  "ok": true,
  "tier": "paid",
  "count": 50,
  "recalls": [
    {
      "recall_id": "24-123",
      "title": "Product Recall: Toy Car Choking Hazard",
      "hazard": "Choking hazard from small parts",
      "remedy": "Return for full refund",
      "date": "2026-01-15",
      "url": "https://www.cpsc.gov/Recalls/2024/..."
    }
  ]
}
```

### `match` ($0.10 USDC/call via x402)

Match inventory items against recall database.

```json
{
  "name": "match",
  "arguments": {
    "inventory": [
      {
        "name": "Toy Car",
        "brand": "Fisher-Price",
        "upc": "027084123456",
        "sku": "FP-12345",
        "category": "Toys"
      }
    ]
  }
}
```

**Response:**
```json
{
  "ok": true,
  "tier": "paid",
  "items_checked": 1,
  "matches": [
    {
      "item": {
        "name": "Toy Car",
        "brand": "Fisher-Price",
        "upc": "027084123456"
      },
      "recall_id": "24-123",
      "severity": "HIGH",
      "hazard": "Choking hazard from small parts",
      "remedy": "Return for full refund",
      "date": "2026-01-15"
    }
  ]
}
```

## x402 Payment

All paid endpoints require x402 payment via HTTP 402 challenge:

1. Call tool without payment → Returns HTTP 402 with payment details
2. Pay via x402 (USDC on Base)
3. Retry with `X-402-Receipt` header

**Pricing:**
- `feed`: $0.05 USDC per call
- `match`: $0.10 USDC per call

**Settlement:** USDC on Base (Chain ID: 8453)
**Asset:** USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
**Pay To:** 0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01

## Trial Onramp

New agents can claim 50 free credits:

```bash
# Claim trial
curl -X POST https://www.nanoempireai.com/v1/trial \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "my-agent-123"}'

# Returns: {"trial_token": "trial_...", "credits": 50, "expires_at": 1728000000, "endpoints": ["/feed", "/match"]}

# Use trial token
curl -X POST https://www.nanoempireai.com/api/v1/feed \
  -H "Authorization: Bearer trial_token_here" \
  -H "Content-Type: application/json" \
  -d '{"since": "2026-01-01", "limit": 10}'
```

## Smithery Deployment

This server is deployed to Smithery at:
- **Namespace:** `rob-c8hu`
- **URL:** https://smithery.ai/servers/rob-c8hu/recallguard-mcp
- **Grade:** A (Production Certified)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode
npm run dev

# Run tests
npm test

# Lint
npm run lint
```

## License

MIT License - see LICENSE file for details.

---

**Nano Empire AI** — Building the autonomous machine economy.  
https://nanoempireai.com | @nanoempireai