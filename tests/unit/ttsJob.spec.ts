import { describe, expect, it, vi } from "vitest";
import { processTtsJob } from "../../lib/ttsWorker";

const voiceId = "voice-test";

describe("processTtsJob", () => {
  it("skips when story body missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await processTtsJob(
      { storyId: "story-1" },
      {
        voiceId,
        getStory: async () => ({ id: "story-1", slug: "story-1" }),
        upsertAudio: vi.fn().mockResolvedValue(undefined),
        putObject: vi.fn().mockResolvedValue(undefined),
        getUrl: vi.fn(),
        generate: vi.fn(),
      },
    );
    expect(result).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("stores audio when body exists", async () => {
    const putObject = vi.fn().mockResolvedValue(undefined);
    const upsertAudio = vi.fn().mockResolvedValue(undefined);
    const generate = vi.fn().mockResolvedValue(Buffer.from("audio"));
    const getUrl = vi.fn().mockReturnValue("/api/assets/audio/story.mp3");

    const result = await processTtsJob(
      { storyId: "story-2" },
      {
        voiceId,
        getStory: async () => ({
          id: "story-2",
          slug: "story-2",
          body: { html: "<p>Hello</p>" },
          audio: { durationSec: 5 },
        }),
        upsertAudio,
        putObject,
        getUrl,
        generate,
      },
    );

    expect(generate).toHaveBeenCalledWith("<p>Hello</p>");
    expect(putObject).toHaveBeenCalled();
    expect(upsertAudio).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { storyId: "story-2" },
        update: expect.objectContaining({
          url: "/api/assets/audio/story.mp3",
          voice: voiceId,
        }),
      }),
    );
    expect(result).toBe("/api/assets/audio/story.mp3");
  });
});
