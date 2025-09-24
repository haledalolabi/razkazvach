import { Worker } from "bullmq";
import { processTtsJob } from "@/lib/ttsWorker";
import { registerTtsQueueEvents } from "@/lib/ttsQueue";

const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" };
const concurrency = Number(process.env.QUEUE_CONCURRENCY ?? 2);

registerTtsQueueEvents();

const worker = new Worker(
  "tts",
  async (job) => {
    console.log("[tts] processing", { id: job.id, storyId: job.data.storyId });
    return processTtsJob({ storyId: job.data.storyId });
  },
  { connection, concurrency },
);

worker.on("completed", (job) => {
  console.log("[tts] worker job completed", job.id);
});

worker.on("failed", (job, error) => {
  console.error("[tts] worker job failed", { id: job?.id, error });
});

console.log("[tts] worker started", { concurrency, redis: connection.url });
