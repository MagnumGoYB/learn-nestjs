import { registerAs } from '@nestjs/config'
import { RateLimiterOptions } from 'nestjs-rate-limiter'

export default registerAs<RateLimiterOptions>('rate-limiter', () => ({
  logger: true,
  points: 100, // limit each IP to 100 requests per duration
  duration: 10 * 60 // 10 minutes
}))
