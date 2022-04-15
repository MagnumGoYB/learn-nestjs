import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Request,
  UnauthorizedException
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'
import { LoginCaptchaDto, LoginDto, LoginTypeEnum } from './app.dto'
import { JWTAuthGuard } from './auth/auth.guard'
import { SmsService } from './sms/sms.service'
import { RequestWithJWTUserDto } from './user/dto/user.dto'

@ApiTags('Global')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly smsService: SmsService) {}

  @ApiOperation({ summary: '登录' })
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

  @ApiOperation({ summary: '获取手机登录验证码' })
  @Post('login/captcha')
  async getLoginCaptcha(
    @Body()
    { phone }: LoginCaptchaDto
  ) {
    await this.smsService.sendLoginCode(phone)
  }

  @ApiOperation({ summary: '获取登录态信息' })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Get('profile')
  async getProfile(
    @Request()
    req: RequestWithJWTUserDto
  ) {
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
