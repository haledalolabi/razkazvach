import { request } from "undici";

export async function generateTTS(html: string): Promise<Buffer> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!voiceId) throw new Error("ELEVENLABS_VOICE_ID is not configured");
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not configured");

  const text = htmlToPlainText(html).slice(0, 5000);
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const response = await request(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.8 },
    }),
  });

  if (response.statusCode >= 300) {
    const errorBody = await response.body.text().catch(() => "");
    throw new Error(`TTS failed: ${response.statusCode} ${errorBody}`);
  }

  const arrayBuffer = await response.body.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
