# agentic-transcribe agent guide

Transcribe one audio file with timestamps.

## The three faces

- SDK: `import { transcribeAudio } from "agentic-transcribe"`.
- CLI: `npx agentic-transcribe transcribe --file recording.mp3`.
- MCP: `npx agentic-transcribe mcp`, then call `transcribe_audio`.

All faces return the same transcript JSON shape.

## Rules

- Dry run is the default.
- Use `--live` or MCP `live: true` only for vendor calls.
- A live call needs the matching API key.
- Never hide vendor errors.
- Tests use fixtures and never call the network.
