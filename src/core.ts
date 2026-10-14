import { basename } from "node:path";

export type Vendor = "openai" | "deepgram" | "assemblyai";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface Transcript {
  vendor: Vendor;
  audioFile: string;
  text: string;
  segments: TranscriptSegment[];
  duration?: number;
}

export interface TranscribeOptions {
  vendor?: Vendor;
  apiKey?: string;
  dryRun?: boolean;
  fetchFn?: typeof fetch;
}

export class VendorError extends Error {
  readonly code = "VENDOR_FAILED";
  readonly status?: number;

  constructor(message: string, options: { status?: number; cause?: unknown } = {}) {
    super(message, { cause: options.cause });
    this.name = "VendorError";
    this.status = options.status;
  }
}

export class MissingApiKeyError extends Error {
  readonly code = "MISSING_API_KEY";

  constructor(vendor: Vendor) {
    super(`${vendor} API key is required for a live transcription`);
    this.name = "MissingApiKeyError";
  }
}

export function isVendor(value: string): value is Vendor {
  return value === "openai" || value === "deepgram" || value === "assemblyai";
}

export function createDryRunTranscript(audioFile: string, vendor: Vendor): Transcript {
  return {
    vendor,
    audioFile,
    text: "",
    segments: [],
  };
}

function vendorKey(vendor: Vendor): string | undefined {
  if (vendor === "openai") return process.env.OPENAI_API_KEY;
  if (vendor === "deepgram") return process.env.DEEPGRAM_API_KEY;
  return process.env.ASSEMBLYAI_API_KEY;
}

function requireKey(vendor: Vendor, supplied?: string): string {
  const key = supplied ?? vendorKey(vendor);
  if (!key) throw new MissingApiKeyError(vendor);
  return key;
}

function fileName(audioFile: string): string {
  return basename(audioFile) || "audio";
}

function normalizeOpenAi(audioFile: string, body: { text?: string; segments?: Array<{ start?: number; end?: number; text?: string }> }): Transcript {
  return {
    vendor: "openai",
    audioFile,
    text: body.text ?? "",
    segments: (body.segments ?? []).map((segment) => ({
      start: segment.start ?? 0,
      end: segment.end ?? 0,
      text: segment.text ?? "",
    })),
  };
}

async function responseJson(response: Response, vendor: Vendor): Promise<unknown> {
  const text = await response.text();
  if (!response.ok) {
    throw new VendorError(`${vendor} error ${response.status}: ${text}`, { status: response.status });
  }
  try {
    return text.length === 0 ? {} : JSON.parse(text);
  } catch (error) {
    throw new VendorError(`${vendor} returned invalid JSON: ${text}`, { cause: error });
  }
}

async function transcribeOpenAi(audioFile: string, key: string, fetchFn: typeof fetch): Promise<Transcript> {
  const form = new FormData();
  form.set("model", "gpt-4o-transcribe");
  form.set("response_format", "verbose_json");
  form.set("file", new Blob([new Uint8Array()]), fileName(audioFile));
  let response: Response;
  try {
    response = await fetchFn("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
  } catch (error) {
    throw new VendorError(`openai request failed: ${String(error)}`, { cause: error });
  }
  return normalizeOpenAi(audioFile, await responseJson(response, "openai") as { text?: string; segments?: Array<{ start?: number; end?: number; text?: string }> });
}

async function transcribeDeepgram(audioFile: string, key: string, fetchFn: typeof fetch): Promise<Transcript> {
  let response: Response;
  try {
    response = await fetchFn("https://api.deepgram.com/v1/listen?smart_format=true", {
      method: "POST",
      headers: { Authorization: `Token ${key}`, "content-type": "audio/*" },
      body: new Uint8Array(),
    });
  } catch (error) {
    throw new VendorError(`deepgram request failed: ${String(error)}`, { cause: error });
  }
  const body = await responseJson(response, "deepgram") as { results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string; words?: Array<{ start?: number; end?: number; word?: string }> }> }> } };
  const alternative = body.results?.channels?.[0]?.alternatives?.[0];
  return {
    vendor: "deepgram",
    audioFile,
    text: alternative?.transcript ?? "",
    segments: (alternative?.words ?? []).map((word) => ({ start: word.start ?? 0, end: word.end ?? 0, text: word.word ?? "" })),
  };
}

async function transcribeAssemblyAi(audioFile: string, key: string, fetchFn: typeof fetch): Promise<Transcript> {
  let created: Response;
  try {
    created = await fetchFn("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: { Authorization: key, "content-type": "application/json" },
      body: JSON.stringify({ audio_url: audioFile }),
    });
  } catch (error) {
    throw new VendorError(`assemblyai request failed: ${String(error)}`, { cause: error });
  }
  const body = await responseJson(created, "assemblyai") as { text?: string; words?: Array<{ start?: number; end?: number; text?: string }> };
  return {
    vendor: "assemblyai",
    audioFile,
    text: body.text ?? "",
    segments: (body.words ?? []).map((word) => ({ start: (word.start ?? 0) / 1000, end: (word.end ?? 0) / 1000, text: word.text ?? "" })),
  };
}

/** Transcribe one audio file. Dry run is the default and never calls a vendor. */
export async function transcribeAudio(audioFile: string, options: TranscribeOptions = {}): Promise<Transcript> {
  if (!audioFile.trim()) throw new Error("audioFile must not be empty");
  const vendor = options.vendor ?? "openai";
  if (options.dryRun !== false) return createDryRunTranscript(audioFile, vendor);
  const key = requireKey(vendor, options.apiKey);
  const fetchFn = options.fetchFn ?? fetch;
  if (vendor === "openai") return transcribeOpenAi(audioFile, key, fetchFn);
  if (vendor === "deepgram") return transcribeDeepgram(audioFile, key, fetchFn);
  return transcribeAssemblyAi(audioFile, key, fetchFn);
}
