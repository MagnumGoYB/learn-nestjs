import Redis from 'ioredis'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class LockService {
  private readonly logger = new Logger(LockService.name)
  public readonly uuid: string = LockService.generateUuid()

  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  /**
   * Generate a uuid for identify each distributed node
   */
  private static generateUuid(): string {
    let d = Date.now()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
      const r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  /**
   * Try to lock
   * @param {string} name lock name
   * @param {number} [expire] seconds, TTL for the redis key
   * @returns {boolean} true: success, false: failed
   */
  public async tryLock(name: string, expire = 60) {
    const result = await this.redisClient.eval(
      `
        if (redis.call('exists', KEYS[1]) == 0) then
          redis.call('hset', KEYS[1], ARGV[1], '1');
          redis.call('expire', KEYS[1], ARGV[2]);
          return 1;
        end;
        if (redis.call('hexists', KEYS[1], ARGV[1]) == 1) then
          redis.call('hincrby', KEYS[1], ARGV[1], '1');
          redis.call('expire', KEYS[1], ARGV[2]);
          return 1;
        end;
        return 0;
      `,
      1,
      name,
      this.uuid,
      expire
    )
    return result !== null && +result === 1
  }

  /**
   * Unlock a lock by name
   * @param {string} name lock name
   */
  public async unlock(name) {
    await this.redisClient.eval(
      `
        if (redis.call('hexists', KEYS[1], ARGV[1]) == 0) then
            return nil;
        end;
        local count = redis.call('hincrby', KEYS[1], ARGV[1], -1);
        if (count == 0) then
            redis.call('del', KEYS[1]);
            return nil;
        end;
      `,
      1,
      name,
      this.uuid
    )
  }
}
