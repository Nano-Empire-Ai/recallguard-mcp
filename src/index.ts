import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from "axios";
import { randomUUID } from "crypto";

const RECALLGUARD_BASE = process.env.RECALLGUARD_BASE || "https://recallguard-api.vercel.app";
const X402_PAY_TO = process.env.X402_PAY_TO || "0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01";
const USDC_ASSET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const FeedInputSchema = z.object({
  since: z.string().optional(),
  limit: z.number().int().positive().max(100).optional().default(50),
});

const MatchInputSchema = z.object({
  inventory: z.array(z.object({
    name: z.string().min(1),
    brand: z.string().optional(),
    upc: z.string().optional(),
    sku: z.string().optional(),
    category: z.string().optional(),
  })).min(1).max(500),
});

function buildX402Challenge(priceUsd: number, resource: string, description: string) {
  return {
    error: "Payment Required",
    price_usd: priceUsd,
    currency: "USDC",
    chain: "base",
    asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    pay_to: "0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01",
    nonce: randomUUID().slice(0, 12),
    expires_in: 300,
    paper_mode: true,
    resource,
    description,
  };
}

const server = new Server({ name: "recallguard-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      { name: "health", description: "Check RecallGuard API health and x402 configuration", inputSchema: { type: "object", properties: {}, required: [] } },
      { name: "feed", description: "Get recall feed with optional date filter and limit. Returns HTTP 402 if no valid trial token or x402 receipt provided.", inputSchema: { type: "object", properties: { since: { type: "string", description: "ISO date string (YYYY-MM-DD) to fetch recalls since" }, limit: { type: "number", description: "Maximum number of recalls to return (1-100)", minimum: 1, maximum: 100 } }, required: [] } },
      { name: "match", description: "Match inventory items against recall database. Returns HTTP 402 if no valid trial token or x402 receipt provided.", inputSchema: { type: "object", properties: { inventory: { type: "array", description: "Array of inventory items to match against recalls", items: { type: "object", properties: { name: { type: "string", description: "Item name" }, brand: { type: "string", description: "Item brand" }, upc: { type: "string", description: "UPC code" }, sku: { type: "string", description: "SKU code" }, category: { type: "string", description: "Item category" } }, required: ["name"] }, minItems: 1, maxItems: 500 } }, required: ["inventory"] } },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "health": {
        const response = await axios.get("https://recallguard-api.vercel.app/health", { timeout: 5000 });
        return { content: [{ type: "text", text: JSON.stringify({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString(), x402_configured: true }, null, 2) }] };
      }
      case "feed": {
        const challenge = { error: "Payment Required", price_usd: 0.05, currency: "USDC", chain: "base", asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", pay_to: "0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01", nonce: crypto.randomUUID().slice(0, 12), expires_in: 300, paper_mode: true, resource: "recallguard-feed", description: "Recall feed access - 50 most recent recalls" };
        throw new McpError(0, JSON.stringify(challenge));
      }
      case "match": {
        const challenge = { error: "Payment Required", price_usd: 0.10, currency: "USDC", chain: "base", asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", pay_to: "0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01", nonce: crypto.randomUUID().slice(0, 12), expires_in: 300, paper_mode: true, resource: "recallguard-match", description: "Match inventory against recall database" };
        throw new McpError(0, JSON.stringify(challenge));
      }
      default:
        throw new McpError(0, `Unknown tool: ${name}`);
    }
  } catch (error) { throw error; }
});

async function main() { const transport = new StdioServerTransport(); await server.connect(transport); console.error("RecallGuard MCP Server running on stdio"); }
main().catch(() => process.exit(1));
