import Redis from 'ioredis';

interface IRedisLike {
  set(key: string, value: string, mode: string, ttl: number): Promise<'OK'>;
  get(key: string): Promise<string | null>;
  del(key: string | string[]): Promise<number>;
  disconnect(): void;
  on?(event: string, listener: (...args: any[]) => void): void;
}

class MemoryRedis implements IRedisLike {
  private store = new Map<string, { value: string; expiresAt: number }>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // 每 5 分钟清理过期条目
    this.cleanupTimer = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key);
    }
  }

  async set(key: string, value: string, _mode: string, ttl: number): Promise<'OK'> {
    this.store.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    let count = 0;
    for (const k of keys) {
      if (this.store.delete(k)) count++;
    }
    return count;
  }

  disconnect() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.store.clear();
  }
}

let _client: IRedisLike | null = null;

export function getRedis(): IRedisLike {
  if (_client) return _client;

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    console.log('[Redis] 使用外部 Redis 连接');
    const redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
      connectTimeout: 8000,
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });

    redisClient.on('error', (err: Error) => {
      console.warn('[Redis] 连接错误:', err.message);
    });

    _client = redisClient as unknown as IRedisLike;
  } else {
    console.log('[Redis] REDIS_URL 未设置，使用内存存储（重启后数据丢失）');
    _client = new MemoryRedis();
  }

  return _client;
}

export function disconnectRedis() {
  if (_client) {
    _client.disconnect();
    _client = null;
  }
}
