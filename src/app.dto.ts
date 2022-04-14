import { ApiProperty } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsPhoneNumber, Length, ValidateIf } from 'class-validator'

export enum LoginTypeEnum {
  phone,
  wechat
}

export class LoginDto {
  @ApiProperty({ title: '登录方式' })
  @IsEnum(LoginTypeEnum)
  readonly type: LoginTypeEnum

  @ApiProperty({
    title: '手机',
    description: '登录方式为 phone 时必传'
  })
  @ValidateIf((dto: LoginDto) => +LoginTypeEnum[dto.type] === LoginTypeEnum.phone)
  @IsNotEmpty()
  @IsPhoneNumber('CN')
  readonly phone?: string

  @ApiProperty({
    title: '验证码',
    description: '登录方式为 phone 时必传'
  })
  @ValidateIf((dto: LoginDto) => +LoginTypeEnum[dto.type] === LoginTypeEnum.phone)
  @IsNotEmpty()
  @Length(6)
  readonly captcha?: string

  @ApiProperty({
    title: '微信授权 Code',
    description: '登录方式为 wechat 时必传'
  })
  @ValidateIf((dto: LoginDto) => +LoginTypeEnum[dto.type] === LoginTypeEnum.wechat)
  @IsNotEmpty()
  readonly code?: string
}

export class LoginResultDto {
  @ApiProperty({ title: '访问令牌' })
  readonly accessToken: string
}

export class LoginCaptchaDto {
  @ApiProperty({ title: '手机' })
  @IsNotEmpty()
  @IsPhoneNumber('CN')
  readonly phone: string
}

export class ProfileDto implements Pick<User, 'id' | 'name' | 'phone' | 'email'> {
  @ApiProperty({ title: '用户ID' })
  id: User['id']

  @ApiProperty({ title: '昵称' })
  name: User['name'] | null

  @ApiProperty({ title: '手机号' })
  phone: User['phone'] | null

  @ApiProperty({ title: '邮箱' })
  email: User['email'] | null
}
