import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { LoginDto, LoginResultDto, ProfileDto } from './app.dto'
import { AuthService } from './auth/auth.service'
import { SmsService } from './sms/sms.service'
import { JWTUserDto, UserRole } from './user/dto/user.dto'
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

    let user: JWTUserDto
    const existUser = await this.userService.findOneByPhone(body.phone)

    if (!existUser) {
      console.log('新用户注册 -> ', body.phone)
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
    console.log(body)
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
