import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Request,
  UnauthorizedException
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { AppService } from './app.service'
import { LoginCaptchaDto, LoginDto, LoginTypeEnum } from './app.dto'
import { JWTAuthGuard } from './auth/auth.guard'
import { SmsService } from './sms/sms.service'

@ApiTags('全局')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly smsService: SmsService) {}

  @ApiBody({
    type: LoginDto,
    examples: {
      phone: {
        value: {
          type: 'phone',
          phone: '13333333333',
          captcha: '000123'
        }
      },
      wechat: {
        value: {
          type: 'wechat',
          code: '0t1e2s3t4'
        }
      }
    }
  })
  @Post('login')
  async login(
    @Body()
    body: LoginDto
  ) {
    const { type, phone, captcha } = body
    switch (+LoginTypeEnum[type]) {
      case LoginTypeEnum.phone:
        return this.appService.loginWithCaptcha({ phone, captcha })
      case LoginTypeEnum.wechat:
        return this.appService.loginWithWeChat(body)
    }
  }

  @Post('login/captcha')
  async getLoginCaptcha(
    @Body()
    { phone }: LoginCaptchaDto
  ) {
    await this.smsService.sendLoginCode(phone)
  }

  @ApiBearerAuth()
  @Get('profile')
  @UseGuards(JWTAuthGuard)
  async getProfile(@Request() req: { user: { userId: User['id'] } }) {
    const { userId } = req.user
    if (!userId) {
      throw new UnauthorizedException()
    }
    const profile = await this.appService.getProfile(userId)
    if (!profile) {
      throw new UnauthorizedException()
    }
    return profile
  }
}
