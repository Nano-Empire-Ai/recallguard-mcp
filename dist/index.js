"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const RECALLGUARD_BASE = process.env.RECALLGUARD_BASE || "https://recallguard-api.vercel.app";
const X402_PAY_TO = process.env.X402_PAY_TO || "0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01";
const USDC_ASSET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const FeedInputSchema = zod_1.z.object({
    since: zod_1.z.string().optional(),
    limit: zod_1.z.number().int().positive().max(100).optional().default(50),
});
const MatchInputSchema = zod_1.z.object({
    inventory: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        brand: zod_1.z.string().optional(),
        upc: zod_1.z.string().optional(),
        sku: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
    })).min(1).max(500),
});
function buildX402Challenge(priceUsd, resource, description) {
    return {
        error: "Payment Required",
        price_usd: priceUsd,
        currency: "USDC",
        chain: "base",
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        pay_to: "0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01",
        nonce: (0, crypto_1.randomUUID)().slice(0, 12),
        expires_in: 300,
        paper_mode: true,
        resource,
        description,
    };
}
const server = new index_js_1.Server({ name: "recallguard-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            { name: "health", description: "Check RecallGuard API health and x402 configuration", inputSchema: { type: "object", properties: {}, required: [] } },
            { name: "feed", description: "Get recall feed with optional date filter and limit. Returns HTTP 402 if no valid trial token or x402 receipt provided.", inputSchema: { type: "object", properties: { since: { type: "string", description: "ISO date string (YYYY-MM-DD) to fetch recalls since" }, limit: { type: "number", description: "Maximum number of recalls to return (1-100)", minimum: 1, maximum: 100 } }, required: [] } },
            { name: "match", description: "Match inventory items against recall database. Returns HTTP 402 if no valid trial token or x402 receipt provided.", inputSchema: { type: "object", properties: { inventory: { type: "array", description: "Array of inventory items to match against recalls", items: { type: "object", properties: { name: { type: "string", description: "Item name" }, brand: { type: "string", description: "Item brand" }, upc: { type: "string", description: "UPC code" }, sku: { type: "string", description: "SKU code" }, category: { type: "string", description: "Item category" } }, required: ["name"] }, minItems: 1, maxItems: 500 } }, required: ["inventory"] } },
        ],
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "health": {
                const response = await axios_1.default.get("https://recallguard-api.vercel.app/health", { timeout: 5000 });
                return { content: [{ type: "text", text: JSON.stringify({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString(), x402_configured: true }, null, 2) }] };
            }
            case "feed": {
                const challenge = { error: "Payment Required", price_usd: 0.05, currency: "USDC", chain: "base", asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", pay_to: "0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01", nonce: crypto.randomUUID().slice(0, 12), expires_in: 300, paper_mode: true, resource: "recallguard-feed", description: "Recall feed access - 50 most recent recalls" };
                throw new types_js_1.McpError(0, JSON.stringify(challenge));
            }
            case "match": {
                const challenge = { error: "Payment Required", price_usd: 0.10, currency: "USDC", chain: "base", asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", pay_to: "0x90E23A7b6F6494A879d05DDC4278D0e55Dec1e01", nonce: crypto.randomUUID().slice(0, 12), expires_in: 300, paper_mode: true, resource: "recallguard-match", description: "Match inventory against recall database" };
                throw new types_js_1.McpError(0, JSON.stringify(challenge));
            }
            default:
                throw new types_js_1.McpError(0, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        throw error;
    }
});
async function main() { const transport = new stdio_js_1.StdioServerTransport(); await server.connect(transport); console.error("RecallGuard MCP Server running on stdio"); }
main().catch(() => process.exit(1));
//# sourceMappingURL=index.js.map