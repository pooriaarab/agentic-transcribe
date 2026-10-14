# agentic-transcribe

Transcribe one audio file with timestamps.

Dry run is the default. Use `--live` to call OpenAI, Deepgram, or
AssemblyAI. Vendor errors are returned as errors.

## Install

```sh
npm install agentic-transcribe
```

## Quick start

This is a dry run. It makes no network call.

```sh
npx agentic-transcribe transcribe --file recording.mp3
```

```json
{"vendor":"openai","audioFile":"recording.mp3","text":"","segments":[]}
```

Use `--live` only when you are ready to call a vendor:

```sh
OPENAI_API_KEY=... npx agentic-transcribe transcribe --file recording.mp3 --live
```

## Three uses

### CLI

```sh
agentic-transcribe transcribe --file recording.mp3 --vendor deepgram
```

### Library

```js
import { transcribeAudio } from "agentic-transcribe";

const transcript = await transcribeAudio("recording.mp3");
```

### MCP

```sh
agentic-transcribe mcp
```

Call `transcribe_audio` with `audioFile`, optional `vendor`, and optional
`live`. The returned JSON shape is the same in every interface.

## Vendors

- OpenAI: `OPENAI_API_KEY`
- Deepgram: `DEEPGRAM_API_KEY`
- AssemblyAI: `ASSEMBLYAI_API_KEY`

The package runs on Node 18 or newer.

## License

MIT
