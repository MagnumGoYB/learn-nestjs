import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { User } from '@prisma/client'
import keymachine from 'keymachine'
import Redis from 'ioredis'
import { LoginDto } from '@/app.dto'

@Injectable()
export class SmsService {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async sendLoginCode(phone: User['phone']) {
    try {
      const code = keymachine({
        possibility: '0123456789',
        length: 6
      })

      // Redis 限制 5 分钟内只能获取一次验证码
      const ok = await this.redisClient.set(`LOGIN:${phone}:CODE`, code, 'EX', 60 * 5, 'NX')

      // TODO 短信服务SDK

      if (!ok) {
        throw new BadRequestException()
      }
    } catch (error) {
      console.error(error)
      throw new BadRequestException()
    }
  }

  async verifyLoginCode(phone: User['phone'], captcha: LoginDto['captcha']) {
    const code = await this.redisClient.get(`LOGIN:${phone}:CODE`)
    if (!code || (code && code !== captcha)) {
      throw new BadRequestException(['captcha is error'])
    }
    this.redisClient.getdel(`LOGIN:${phone}:CODE`)
  }
}
