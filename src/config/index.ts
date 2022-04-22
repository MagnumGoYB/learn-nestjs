import { registerAs } from '@nestjs/config'

export { default as RedisConfig } from './redis.config'
export { default as RateLimiterConfig } from './rate-limiter.config'

export type GlobalConfigOptions = {
  smsKeyPrefix?: string
  seckillKeyPrefix?: string
  orderSecondsDuration?: number
}

export default registerAs<GlobalConfigOptions>('global', () => ({
  seckillKeyPrefix: ':SECKILL',
  smsKeyPrefix: ':SMS',
  orderSecondsDuration: process.env.ORDER_SECONDS_DURATION
    ? +process.env.ORDER_SECONDS_DURATION
    : 10 * 60 // 默认值：10分钟
}))
