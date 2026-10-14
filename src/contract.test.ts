import { describe, expect, test } from "vitest";
import { createDryRunTranscript, isVendor, transcribeAudio } from "./core.js";

describe("transcription contract", () => {
  test("has one stable dry run shape", async () => {
    expect(createDryRunTranscript("a.wav", "openai")).toEqual({ vendor: "openai", audioFile: "a.wav", text: "", segments: [] });
    await expect(transcribeAudio("a.wav")).resolves.toEqual(createDryRunTranscript("a.wav", "openai"));
  });
  test("recognizes supported vendors", () => {
    expect(isVendor("deepgram")).toBe(true);
    expect(isVendor("other")).toBe(false);
  });
});
