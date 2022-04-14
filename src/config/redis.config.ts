import { registerAs } from '@nestjs/config'
import { RedisModuleOptions } from '@liaoliaots/nestjs-redis'

export default registerAs<RedisModuleOptions>('redis', () => ({
  readyLog: true,
  config: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379,
    keyPrefix:
      process.env.REDIS_KEY_PREFIX ?? process.env.npm_package_name
        ? process.env.npm_package_name.toUpperCase() + ':'
        : ''
  }
}))
