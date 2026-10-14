import { transcribeAudio } from "./core.js";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/transcribe") {
      const body = await request.json() as { audioFile?: string };
      if (!body.audioFile) return Response.json({ error: "audioFile is required" }, { status: 400 });
      return Response.json(await transcribeAudio(body.audioFile));
    }
    return Response.json({ error: "not found" }, { status: 404 });
  },
};
