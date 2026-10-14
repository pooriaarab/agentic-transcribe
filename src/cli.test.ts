import { describe, expect, test } from "vitest";
import { parseArgs, runCli, UsageError } from "./cli.js";

describe("CLI", () => {
  test("defaults to dry run", () => expect(parseArgs(["transcribe", "--file", "clip.wav"])).toMatchObject({ dryRun: true, vendor: "openai" }));
  test("accepts live and vendor", () => expect(parseArgs(["transcribe", "--file", "clip.wav", "--vendor", "deepgram", "--live"])).toMatchObject({ dryRun: false, vendor: "deepgram" }));
  test("rejects unknown vendors", () => expect(() => parseArgs(["transcribe", "--file", "x", "--vendor", "nope"])).toThrow(UsageError));
  test("prints a dry run transcript", async () => { const lines: string[] = []; expect(await runCli(["transcribe", "--file", "clip.wav"], { out: (x: string) => lines.push(x), err: () => {} })).toBe(0); expect(JSON.parse(lines[0])).toMatchObject({ audioFile: "clip.wav", segments: [] }); });
});
