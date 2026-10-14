import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, test } from "vitest";
import { createMcpServer } from "./mcp.js";

test("MCP serves the same dry run shape", async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createMcpServer(); await server.connect(serverTransport);
  const client = new Client({ name: "test", version: "0" }); await client.connect(clientTransport);
  try { const reply = await client.callTool({ name: "transcribe_audio", arguments: { audioFile: "clip.wav" } }); const text = ((reply as { content: Array<{ text: string }> }).content[0]).text; expect(JSON.parse(text)).toMatchObject({ audioFile: "clip.wav", segments: [] }); }
  finally { await client.close(); await server.close(); }
});
