# agentic-transcribe

agentic-transcribe turns one local audio file into text with timestamps using OpenAI, Deepgram, or AssemblyAI. It provides a CLI, an MCP server, and a JavaScript API. It does not listen to a live stream.

## Install

```sh
npm install agentic-transcribe
```

## Quick start

The default command is a dry run. It exits successfully and makes no network call.

```sh
npx agentic-transcribe transcribe --file recording.mp3
```

```json
{"vendor":"openai","audioFile":"recording.mp3","text":"","segments":[]}
```

Use `--live` only when you are ready to send the audio to a vendor.

## Vendors

| Brand | Environment key | Live command |
| --- | --- | --- |
| OpenAI | `OPENAI_API_KEY` | `OPENAI_API_KEY=... npx agentic-transcribe transcribe --file recording.mp3 --vendor openai --live` |
| Deepgram | `DEEPGRAM_API_KEY` | `DEEPGRAM_API_KEY=... npx agentic-transcribe transcribe --file recording.mp3 --vendor deepgram --live` |
| AssemblyAI | `ASSEMBLYAI_API_KEY` | `ASSEMBLYAI_API_KEY=... npx agentic-transcribe transcribe --file recording.mp3 --vendor assemblyai --live` |

Each live adapter calls its vendor's HTTPS API. Vendor errors are returned as errors.

## CLI

```sh
agentic-transcribe transcribe --file recording.mp3 --vendor deepgram
```

Add `--live` to make a vendor request. Without it, the command is a dry run.

## Library

```js
import { transcribeAudio } from "agentic-transcribe";

const transcript = await transcribeAudio("recording.mp3");
```

Pass `{ dryRun: false, vendor: "openai" }` for a live request.

## MCP

```sh
agentic-transcribe mcp
```

Call `transcribe_audio` with `audioFile`, optional `vendor`, and optional `live`. All interfaces return the same transcript JSON shape.

The package runs on Node 18 or newer.

## License

MIT
