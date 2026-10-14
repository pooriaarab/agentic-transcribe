import { describe, expect, test } from "vitest";
import worker from "./worker.js";

describe("worker", () => {
  test("returns a dry run transcript", async () => {
    const response = await worker.fetch(new Request("https://example.test/transcribe", { method: "POST", body: JSON.stringify({ audioFile: "clip.wav" }) }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ audioFile: "clip.wav", segments: [] });
  });
});
