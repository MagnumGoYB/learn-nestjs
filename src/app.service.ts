import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { LoginDto, LoginResultDto, ProfileDto } from './app.dto'
import { AuthService } from './auth/auth.service'
import { SmsService } from './sms/sms.service'
import { UserService } from './user/user.service'

@Injectable()
export class AppService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly smsService: SmsService
  ) {}

  async loginWithCaptcha(body: Pick<LoginDto, 'phone' | 'captcha'>): Promise<LoginResultDto> {
    await this.smsService.verifyLoginCode(body.phone, body.captcha)

    let userId
    const existUser = await this.userService.findOneByPhone(body.phone)

    if (!existUser) {
      console.log('新用户注册 -> ', body.phone)
      const newUser = await this.userService.createUser({ phone: body.phone })
      userId = newUser.id
    } else {
      userId = existUser.id
    }

    return this.authService.sign(userId)
  }

  async loginWithWeChat(body: LoginDto): Promise<LoginResultDto> {
    return { accessToken: body.toString() }
  }

  async getProfile(userId: User['id']): Promise<ProfileDto> {
    return this.userService.findOneById(userId).then((user) => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email
    }))
  }
}
