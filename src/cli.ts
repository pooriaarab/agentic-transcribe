#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { realpathSync } from "node:fs";
import { isVendor, MissingApiKeyError, transcribeAudio, VendorError, type Vendor } from "./core.js";
import { DEFAULT_BRAND } from "./index.js";
import { VERSION } from "./version.js";

export class UsageError extends Error { constructor(message: string) { super(message); this.name = "UsageError"; } }
export interface CliRequest { audioFile?: string; vendor: Vendor; dryRun: boolean; command: "transcribe" | "mcp" | "help" | "version"; }

export function parseArgs(argv: string[]): CliRequest {
  const request: CliRequest = { command: "transcribe", vendor: "openai", dryRun: true };
  const args = [...argv]; const first = args.shift();
  if (!first || first === "--help" || first === "-h") return { ...request, command: "help" };
  if (first === "--version" || first === "-V") return { ...request, command: "version" };
  if (first === "mcp") return { ...request, command: "mcp" };
  if (first !== "transcribe") throw new UsageError(`unknown command "${first}"`);
  while (args.length) {
    const flag = args.shift() as string;
    if (flag === "--live") { request.dryRun = false; continue; }
    if (flag === "--file" || flag === "--vendor") {
      const value = args.shift(); if (!value) throw new UsageError(`${flag} needs a value`);
      if (flag === "--file") request.audioFile = value;
      else if (isVendor(value)) request.vendor = value;
      else throw new UsageError(`unknown vendor "${value}"`);
      continue;
    }
    throw new UsageError(`unknown flag "${flag}"`);
  }
  if (!request.audioFile) throw new UsageError("transcribe needs --file");
  return request;
}

function helpText(): string { return `${DEFAULT_BRAND.name} ${VERSION}\n${DEFAULT_BRAND.description}\n\nUsage: agentic-transcribe transcribe --file <audio> [--vendor openai|deepgram|assemblyai] [--live]\n\nDry run is the default. Use --live to call a vendor.\n\nCommands:\n  transcribe  Return JSON transcript with timestamps.\n  mcp         Start the MCP server on stdio.`; }
export async function runCli(argv: string[], io = { out: console.log, err: console.error }): Promise<number> {
  try {
    const request = parseArgs(argv);
    if (request.command === "help") { io.out(helpText()); return 0; }
    if (request.command === "version") { io.out(VERSION); return 0; }
    if (request.command === "mcp") { const { startMcp } = await import("./mcp.js"); await startMcp(); return 0; }
    io.out(JSON.stringify(await transcribeAudio(request.audioFile as string, { vendor: request.vendor, dryRun: request.dryRun })));
    return 0;
  } catch (error) {
    io.err(error instanceof Error ? `${error.name}: ${error.message}` : String(error));
    return error instanceof UsageError ? 2 : 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) runCli(process.argv.slice(2)).then((code) => { if (code) process.exit(code); });
