import Redis from 'ioredis'
import keymachine from 'keymachine'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { GlobalConfigOptions } from '@/config'
import { LoginDto } from '@/app.dto'

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name)
  private readonly smsKeyPrefix: string

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly configService: ConfigService
  ) {
    this.smsKeyPrefix = this.configService.get<GlobalConfigOptions>('global').smsKeyPrefix
  }

  async sendLoginCode(phone: User['phone']) {
    try {
      const code = keymachine({
        possibility: '0123456789',
        length: 6
      })

      // Redis 限制 5 分钟内只能获取一次验证码
      const ok = await this.redisClient.set(
        `${this.smsKeyPrefix}:LOGIN:${phone}:CODE`,
        code,
        'EX',
        60 * 5,
        'NX'
      )

      // TODO 短信服务SDK

      if (!ok) {
        throw new BadRequestException()
      }
    } catch (error) {
      this.logger.debug(error)
      throw new BadRequestException()
    }
  }

  async verifyLoginCode(phone: User['phone'], captcha: LoginDto['captcha']) {
    const code = await this.redisClient.get(`${this.smsKeyPrefix}:LOGIN:${phone}:CODE`)
    if (!code || (code && code !== captcha)) {
      throw new BadRequestException(['captcha is error'])
    }
    this.redisClient.getdel(`${this.smsKeyPrefix}:LOGIN:${phone}:CODE`)
  }
}
