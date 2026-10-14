# agentic-transcribe

[![npm version](https://img.shields.io/npm/v/agentic-transcribe)](https://www.npmjs.com/package/agentic-transcribe)
[![Downloads/month](https://img.shields.io/npm/dm/agentic-transcribe)](https://www.npmjs.com/package/agentic-transcribe)
[![MIT license](https://img.shields.io/npm/l/agentic-transcribe)](https://opensource.org/license/mit)

[Package](https://www.npmjs.com/package/agentic-transcribe) · [Support](https://github.com/pooriaarab/agentic-transcribe/issues)

agentic-transcribe is an open-source audio transcription scaffold with OpenAI, Deepgram, and AssemblyAI request paths, a JavaScript API, CLI, and Model Context Protocol (MCP) server.

## Install

```sh
npm install agentic-transcribe
```

Use Node.js 18 or later. TypeScript declarations are included. The package has two direct runtime dependencies.

## Preview your first request

```sh
npx agentic-transcribe transcribe --file recording.mp3 --vendor openai
```

Expect exit code 0 and this JSON:

```json
{"vendor":"openai","audioFile":"recording.mp3","text":"","segments":[]}
```

This preview requires no audio file or credentials. It performs no file read or network request.
An empty transcript confirms preview behavior; it does not confirm transcription.

```js
import { transcribeAudio } from 'agentic-transcribe';
console.log(await transcribeAudio('recording.mp3', { vendor: 'deepgram' }));
```

## Features and coverage

- **Preview:** Return the transcript shape without vendor calls; dry run is the default across all interfaces.
- **Response mapping:** Map vendor response text and timestamp fields to `text` and `segments`.
- **Errors:** Expose missing API keys, network failures, HTTP failures, and invalid JSON.

Three vendor paths exist. All are scaffolds; none provides verified local-file transcription.

| Integration | Status | Live-path environment key | Current limit |
| --- | --- | --- | --- |
| OpenAI | scaffold | `OPENAI_API_KEY` | Sends an empty file Blob; never reads local audio |
| Deepgram | scaffold | `DEEPGRAM_API_KEY` | Sends an empty byte array; never reads local audio |
| AssemblyAI | scaffold | `ASSEMBLYAI_API_KEY` | Sends the input as `audio_url`; has no upload or job polling |

Tests use mocked responses. This campaign performs zero live credential checks.
The OpenAI path hardcodes `gpt-4o-transcribe` and `verbose_json`; request compatibility is unverified.

## Runtime surfaces and limits

CLI operations are `transcribe`, `mcp`, `--help`/`-h`, and `--version`/`-V`.
`--file` names the input; `--vendor` selects a path. `--live` enables the incomplete vendor request.
CLI usage errors exit 2; other errors exit 1.

Start stdio MCP with `npx agentic-transcribe-mcp` or `npx agentic-transcribe mcp`.
The single tool, `transcribe_audio`, accepts `audioFile`, optional `vendor`, and optional `live`.
The SDK enables vendor calls only with `dryRun: false`. It accepts `apiKey` and `fetchFn` overrides.

Export the matching key before a live request. The package does not load `.env` files.
It has no file upload implementation, automatic retries, timeout setting, streaming, or background job polling.
The repository Worker handler exposes preview-only `POST /transcribe`; it is not a managed service.

## Status and links

Version 0.1.1 is an early scaffold. APIs can change before 1.0.
Use [GitHub issues](https://github.com/pooriaarab/agentic-transcribe/issues) for support.
No public documentation site is configured. Public case studies are not yet published.

## License

MIT.
