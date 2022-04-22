import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { User } from '@prisma/client'
import { LoginDto, LoginResultDto, ProfileDto } from './app.dto'
import { AuthService } from './auth/auth.service'
import { SmsService } from './sms/sms.service'
import { JWTUserDto, UserRole } from './user/dto/user.dto'
import { UserService } from './user/user.service'

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly smsService: SmsService
  ) {}

  async signStressTestUsers() {
    let count = 0
    const tokens = []
    while (count !== 100) {
      const no = count.toString().padStart(4, '0')
      const user = { name: `测试用户_${no}`, phone: `1000000${no}` }
      const existUser = await this.userService.findOneByPhone(user.phone)
      let info: JWTUserDto
      if (!existUser) {
        const result = await this.userService.createUser(user)
        info = {
          userId: result.id,
          role: UserRole[result.role]
        }
        this.logger.debug('测试用户注入', user)
      } else {
        info = {
          userId: existUser.id,
          role: UserRole[existUser.role]
        }
      }
      const token = this.authService.sign({ userId: info.userId, role: info.role })
      tokens.push({ id: info.userId, name: user.name, ...token })
      count++
    }
    return tokens
  }

  async loginWithCaptcha(body: Pick<LoginDto, 'phone' | 'captcha'>): Promise<LoginResultDto> {
    await this.smsService.verifyLoginCode(body.phone, body.captcha)

    let user: JWTUserDto
    const existUser = await this.userService.findOneByPhone(body.phone)

    if (!existUser) {
      this.logger.log('新用户注册', body.phone)
      const newUser = await this.userService.createUser({ phone: body.phone })
      user = {
        userId: newUser.id,
        role: UserRole[newUser.role]
      }
    } else {
      user = {
        userId: existUser.id,
        role: UserRole[existUser.role]
      }
    }

    return this.authService.sign(user)
  }

  async loginWithWeChat(body: LoginDto): Promise<LoginResultDto> {
    // TODO 微信授权登录
    this.logger.log(body)
    throw new BadRequestException()
  }

  async getProfile(userId: User['id']): Promise<ProfileDto> {
    return this.userService.findOneById(userId).then((user) => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      wxId: user.wxId,
      wbId: user.wbId
    }))
  }
}
