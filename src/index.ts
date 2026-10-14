export { VERSION } from "./version.js";
export { MissingApiKeyError, VendorError, createDryRunTranscript, isVendor, transcribeAudio } from "./core.js";
export type { Transcript, TranscriptSegment, TranscribeOptions, Vendor } from "./core.js";

import { VERSION } from "./version.js";
export const DEFAULT_BRAND = {
  name: "Agentic transcribe",
  command: "agentic-transcribe",
  description: "Transcribe one audio file with timestamps.",
  version: VERSION,
} as const;
