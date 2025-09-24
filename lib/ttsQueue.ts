import { Queue, QueueEvents, type JobsOptions } from "bullmq";
import { processTtsJob } from "@/lib/ttsWorker";

const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" };

let queueInstance: Queue | null = null;

function getQueue(): Queue {
  if (!queueInstance) {
    queueInstance = new Queue("tts", {
      connection,
      defaultJobOptions: defaultJobOptions(),
    });
  }
  return queueInstance;
}

export function registerTtsQueueEvents(): QueueEvents {
  const events = new QueueEvents("tts", { connection });
  events.on("completed", ({ jobId }) => {
    console.log("[tts] completed", jobId);
  });
  events.on("failed", ({ jobId, failedReason }) => {
    console.error("[tts] failed", jobId, failedReason);
  });
  return events;
}

export function defaultJobOptions(): JobsOptions {
  return {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  };
}

export async function enqueueTtsJob(storyId: string): Promise<void> {
  const max = Number(process.env.QUEUE_RATE_LIMIT ?? 8);
  const interval = Number(process.env.QUEUE_RATE_INTERVAL_MS ?? 1000);
  let delay = 0;

  if (max > 0 && interval > 0) {
    try {
      const client = await getQueue().client;
      const bucket = Math.floor(Date.now() / interval);
      const key = `tts:rate:${bucket}`;
      const count = await client.incr(key);
      if (count === 1) {
        await client.pexpire(key, interval);
      }
      if (count > max) {
        const ttl = await client.pttl(key);
        delay = ttl > 0 ? ttl : interval;
      }
    } catch (error) {
      console.error("[tts] rate limiter failed", error);
    }
  }

  await getQueue().add(
    "generate",
    { storyId },
    { ...defaultJobOptions(), delay },
  );
}

export type ProcessTtsJob = typeof processTtsJob;
