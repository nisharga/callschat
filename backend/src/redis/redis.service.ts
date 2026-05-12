import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis;
  private readonly subscriber: Redis;
  private readonly publisher: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get('REDIS_HOST', 'localhost');
    const port = parseInt(this.configService.get('REDIS_PORT', '6379'));
    const password = this.configService.get('REDIS_PASSWORD');

    const redisOptions = {
      host,
      port,
      password: password || undefined,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    this.redis = new Redis(redisOptions);
    this.subscriber = new Redis(redisOptions);
    this.publisher = new Redis(redisOptions);

    this.setupErrorHandlers();
  }

  async onModuleInit() {
    try {
      await this.redis.connect();
      this.logger.log('Successfully connected to Redis');

      // Test connection
      await this.redis.ping();
      this.logger.log('Redis connection test successful');
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.redis.disconnect();
    await this.subscriber.disconnect();
    await this.publisher.disconnect();
    this.logger.log('Disconnected from Redis');
  }

  private setupErrorHandlers() {
    this.redis.on('error', (error) => {
      this.logger.error('Redis error:', error);
    });

    this.subscriber.on('error', (error) => {
      this.logger.error('Redis subscriber error:', error);
    });

    this.publisher.on('error', (error) => {
      this.logger.error('Redis publisher error:', error);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.redis.on('disconnect', () => {
      this.logger.warn('Redis disconnected');
    });
  }

  // String operations
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.redis.setex(key, ttl, value);
    }
    return this.redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.redis.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.redis.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redis.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.redis.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redis.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.redis.hdel(key, field);
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.redis.lpush(key, ...values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.redis.rpush(key, ...values);
  }

  async lpop(key: string): Promise<string | null> {
    return this.redis.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return this.redis.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.lrange(key, start, stop);
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.redis.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.redis.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }

  async sismember(key: string, member: string): Promise<number> {
    return this.redis.sismember(key, member);
  }

  // Sorted Set operations
  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.redis.zadd(key, score, member);
  }

  async zrem(key: string, member: string): Promise<number> {
    return this.redis.zrem(key, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.zrange(key, start, stop);
  }

  async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
    return this.redis.zrangebyscore(key, min, max);
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    return this.publisher.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  // Cache operations
  async cacheSet(key: string, value: any, ttl: number = 3600): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.set(key, serialized, ttl);
  }

  async cacheGet<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async cacheDelete(key: string): Promise<number> {
    return this.del(key);
  }

  async cacheDeletePattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    if (keys.length === 0) return 0;
    return this.redis.del(...keys);
  }

  // Utility operations
  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  async flushdb(): Promise<'OK'> {
    return this.redis.flushdb();
  }

  async flushall(): Promise<'OK'> {
    return this.redis.flushall();
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.redis.decr(key);
  }

  async incrby(key: string, increment: number): Promise<number> {
    return this.redis.incrby(key, increment);
  }

  async decrby(key: string, decrement: number): Promise<number> {
    return this.redis.decrby(key, decrement);
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.incr(key);
    if (current === 1) {
      await this.expire(key, window);
    }
    return current <= limit;
  }

  // Session management
  async setSession(userId: string, sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    await this.cacheSet(key, data, ttl);
  }

  async getSession(userId: string, sessionId: string): Promise<any> {
    const key = `session:${userId}:${sessionId}`;
    return this.cacheGet(key);
  }

  async deleteSession(userId: string, sessionId: string): Promise<number> {
    const key = `session:${userId}:${sessionId}`;
    return this.del(key);
  }

  async deleteAllUserSessions(userId: string): Promise<number> {
    const pattern = `session:${userId}:*`;
    return this.cacheDeletePattern(pattern);
  }

  // Online status tracking
  async setUserOnline(userId: string): Promise<void> {
    const key = `user:${userId}:online`;
    await this.set(key, 'true', 300); // 5 minutes TTL
  }

  async setUserOffline(userId: string): Promise<number> {
    const key = `user:${userId}:online`;
    return this.del(key);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const key = `user:${userId}:online`;
    const online = await this.get(key);
    return online === 'true';
  }

  // Message queue
  async enqueueMessage(queue: string, message: any): Promise<number> {
    const key = `queue:${queue}`;
    const serialized = JSON.stringify(message);
    return this.rpush(key, serialized);
  }

  async dequeueMessage(queue: string): Promise<any | null> {
    const key = `queue:${queue}`;
    const message = await this.lpop(key);
    if (!message) return null;
    try {
      return JSON.parse(message);
    } catch {
      return message;
    }
  }

  async getQueueLength(queue: string): Promise<number> {
    const key = `queue:${queue}`;
    return this.redis.llen(key);
  }

  // Lock management
  async acquireLock(lockKey: string, ttl: number = 10): Promise<boolean> {
    const result = await this.redis.set(lockKey, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async releaseLock(lockKey: string): Promise<number> {
    return this.del(lockKey);
  }

  // Statistics and analytics
  async incrementCounter(key: string): Promise<number> {
    return this.incr(key);
  }

  async getCounter(key: string): Promise<number> {
    const value = await this.get(key);
    return value ? parseInt(value) : 0;
  }

  async resetCounter(key: string): Promise<number> {
    return this.del(key);
  }
}
