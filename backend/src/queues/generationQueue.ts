import { Queue } from 'bullmq';
import { redisConnection, checkRedisConnection } from '../config/redis';

type JobHandler = (data: any) => Promise<void>;
const fallbackHandlers: Record<string, JobHandler> = {};

/**
 * Registers a callback handler for in-memory queue tasks.
 */
export function registerFallbackHandler(queueName: string, handler: JobHandler) {
  fallbackHandlers[queueName] = handler;
}

/**
 * Helper to run the fallback task in the background.
 */
async function executeFallbackJob(queueName: string, data: any) {
  const handler = fallbackHandlers[queueName];
  if (handler) {
    try {
      await handler(data);
    } catch (err) {
      console.error(`[Fallback Queue] Job in queue '${queueName}' failed:`, err);
    }
  } else {
    console.error(`[Fallback Queue] No handler registered for queue '${queueName}'`);
  }
}

let realQuestionQueue: Queue | null = null;
let realPdfQueue: Queue | null = null;
let isRedisActive: boolean | null = null;

/**
 * Lazy initializer for queues to prevent early connection attempts on import.
 */
async function initQueues() {
  if (isRedisActive !== null) return;
  
  isRedisActive = await checkRedisConnection();
  if (isRedisActive) {
    console.log('[Queue] Redis is active. Initializing BullMQ Queues...');
    realQuestionQueue = new Queue('question-generation', {
      connection: redisConnection,
    });
    realPdfQueue = new Queue('pdf-generation', {
      connection: redisConnection,
    });
  } else {
    console.log('[Queue] Redis is not active. Initializing in-memory fallback queues...');
  }
}

export const questionQueue = {
  add: async (name: string, data: any): Promise<any> => {
    await initQueues();
    if (isRedisActive && realQuestionQueue) {
      return realQuestionQueue.add(name, data);
    } else {
      console.log(`[Fallback Queue] Enqueuing 'question-generation' job: ${name}`);
      setImmediate(async () => {
        await executeFallbackJob('question-generation', data);
      });
      return { id: `fallback-${Date.now()}` };
    }
  }
};

export const pdfQueue = {
  add: async (name: string, data: any): Promise<any> => {
    await initQueues();
    if (isRedisActive && realPdfQueue) {
      return realPdfQueue.add(name, data);
    } else {
      console.log(`[Fallback Queue] Enqueuing 'pdf-generation' job: ${name}`);
      setImmediate(async () => {
        await executeFallbackJob('pdf-generation', data);
      });
      return { id: `fallback-${Date.now()}` };
    }
  }
};
