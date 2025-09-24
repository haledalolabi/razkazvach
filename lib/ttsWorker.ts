import { prisma } from "@/lib/prisma";
import { LocalStorage } from "@/lib/storage";
import { generateTTS } from "@/lib/tts";

export interface TtsJobInput {
  storyId: string;
}

export interface StoryRecord {
  id: string;
  slug: string;
  body?: { html: string | null } | null;
  audio?: { durationSec: number | null } | null;
}

export interface TtsJobDependencies {
  getStory(storyId: string): Promise<StoryRecord | null>;
  upsertAudio(args: unknown): Promise<unknown>;
  putObject(key: string, data: Buffer): Promise<void>;
  getUrl(key: string): string;
  generate(html: string): Promise<Buffer>;
  voiceId: string;
}

const defaultDeps: TtsJobDependencies = {
  async getStory(storyId: string) {
    return prisma.story.findUnique({
      where: { id: storyId },
      include: { body: true, audio: true },
    }) as unknown as StoryRecord | null;
  },
  upsertAudio(args) {
    return prisma.audioAsset.upsert(args as never);
  },
  putObject(key, data) {
    return LocalStorage.putObject(key, data);
  },
  getUrl(key) {
    return LocalStorage.getUrl(key);
  },
  generate(html) {
    return generateTTS(html);
  },
  voiceId: process.env.ELEVENLABS_VOICE_ID ?? "",
};

export async function processTtsJob(
  input: TtsJobInput,
  overrides: Partial<TtsJobDependencies> = {},
): Promise<string | null> {
  const deps = { ...defaultDeps, ...overrides };
  if (!deps.voiceId) throw new Error("ELEVENLABS_VOICE_ID is not configured");

  const story = await deps.getStory(input.storyId);
  if (!story?.body?.html) {
    console.warn("[tts] story missing body", { storyId: input.storyId });
    return null;
  }

  const buffer = await deps.generate(story.body.html);
  const key = `audio/${story.slug}.mp3`;
  await deps.putObject(key, buffer);

  const url = deps.getUrl(key);
  await deps.upsertAudio({
    where: { storyId: story.id },
    update: {
      url,
      voice: deps.voiceId,
      quality: "std",
      durationSec: story.audio?.durationSec ?? 0,
    },
    create: {
      storyId: story.id,
      url,
      voice: deps.voiceId,
      quality: "std",
      durationSec: 0,
    },
  });

  return url;
}
