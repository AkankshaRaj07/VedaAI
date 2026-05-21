import { ConnectionOptions } from 'bullmq';
import dotenv from 'dotenv';
import net from 'net';

dotenv.config();

export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  username: process.env.REDIS_USERNAME || undefined,
  // If tls is true, specify tls configurations. For Redis Cloud, sometimes tls is needed.
  tls: process.env.REDIS_USE_TLS === 'true' ? {} : undefined,
  maxRetriesPerRequest: null, // Crucial for BullMQ compatibility
};

let cachedRedisStatus: boolean | null = null;

/**
 * Checks if Redis is accessible via TCP without triggering infinite ioredis connection loops.
 */
export const checkRedisConnection = (timeout = 1000): Promise<boolean> => {
  if (cachedRedisStatus !== null) {
    return Promise.resolve(cachedRedisStatus);
  }

  return new Promise((resolve) => {
    const host = redisConnection.host || '127.0.0.1';
    const port = redisConnection.port || 6379;
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(timeout);

    socket.once('connect', () => {
      status = true;
      socket.end();
    });

    socket.once('timeout', () => {
      socket.destroy();
    });

    socket.once('error', () => {
      socket.destroy();
    });

    socket.once('close', () => {
      cachedRedisStatus = status;
      resolve(status);
    });

    socket.connect(port, host);
  });
};

