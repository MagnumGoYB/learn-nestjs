import { registerAs } from '@nestjs/config'
import { RateLimiterOptions } from 'nestjs-rate-limiter'

export default registerAs<RateLimiterOptions>('rate-limiter', () => ({
  logger: true,
  points: 1000000, // limit each IP to 100 requests per duration
  duration: 10 * 60 // 10 minutes
}))
