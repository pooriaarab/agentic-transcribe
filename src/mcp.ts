import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { isVendor, transcribeAudio } from "./core.js";
import { DEFAULT_BRAND } from "./index.js";

const vendors = z.enum(["openai", "deepgram", "assemblyai"]);
const result = (value: unknown, isError = false) => ({ content: [{ type: "text" as const, text: JSON.stringify(value) }], ...(isError ? { isError: true as const } : {}) });
export function createMcpServer(): McpServer {
  const server = new McpServer({ name: DEFAULT_BRAND.command, version: DEFAULT_BRAND.version });
  server.registerTool("transcribe_audio", { description: "Transcribe one audio file. Dry run is the default.", inputSchema: { audioFile: z.string(), vendor: vendors.optional(), live: z.boolean().optional() } }, async ({ audioFile, vendor, live }) => {
    try { return result(await transcribeAudio(audioFile, { vendor: vendor && isVendor(vendor) ? vendor : "openai", dryRun: !live })); }
    catch (error) { return result({ error: error instanceof Error ? error.message : String(error) }, true); }
  });
  return server;
}
export async function startMcp(): Promise<void> { const server = createMcpServer(); await server.connect(new StdioServerTransport()); }
