import { describe, expect, test } from "vitest";
import { MissingApiKeyError, transcribeAudio, VendorError } from "./core.js";

describe("transcribeAudio", () => {
  test("is dry run by default", async () => {
    await expect(transcribeAudio("fixtures/sample.wav")).resolves.toEqual({ vendor: "openai", audioFile: "fixtures/sample.wav", text: "", segments: [] });
  });
  test("uses the selected vendor in dry run", async () => {
    await expect(transcribeAudio("clip.mp3", { vendor: "deepgram" })).resolves.toMatchObject({ vendor: "deepgram" });
  });
  test("requires a key for live calls", async () => {
    await expect(transcribeAudio("clip.mp3", { dryRun: false, apiKey: "" })).rejects.toBeInstanceOf(MissingApiKeyError);
  });
  test("normalizes OpenAI timestamp segments from a fixture response", async () => {
    const fetchFn = async () => new Response(JSON.stringify({ text: "hello world", segments: [{ start: 0, end: 1.2, text: "hello" }] }), { status: 200 });
    const transcript = await transcribeAudio("clip.mp3", { dryRun: false, apiKey: "test", fetchFn: fetchFn as typeof fetch });
    expect(transcript).toEqual({ vendor: "openai", audioFile: "clip.mp3", text: "hello world", segments: [{ start: 0, end: 1.2, text: "hello" }] });
  });
  test("does not hide vendor errors", async () => {
    const fetchFn = async () => new Response("bad request", { status: 400 });
    await expect(transcribeAudio("clip.mp3", { dryRun: false, apiKey: "test", fetchFn: fetchFn as typeof fetch })).rejects.toThrow(VendorError);
  });
});
