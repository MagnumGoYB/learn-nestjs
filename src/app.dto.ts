import { ApiProperty } from '@nestjs/swagger'
import { User } from '@prisma/client'
import {
  isDefined,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsNumberString,
  Length,
  ValidateIf
} from 'class-validator'
import { UserDto } from './user/dto/user.dto'

export enum LoginTypeEnum {
  phone,
  wechat
}

export enum OrderByEnum {
  asc,
  desc
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
  @IsMobilePhone('zh-CN')
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
  @IsMobilePhone('zh-CN')
  readonly phone: string
}

export class ProfileDto extends UserDto {
  @ApiProperty({ title: '手机号' })
  readonly phone: User['phone'] | null

  @ApiProperty({ title: '邮箱' })
  readonly email: User['email'] | null

  @ApiProperty({ title: '微信ID' })
  readonly wxId: User['wxId'] | null

  @ApiProperty({ title: '微博ID' })
  readonly wbId: User['wbId'] | null
}

export class PaginationDto {
  @ApiProperty({ title: '页码', description: '页码' })
  @ValidateIf((dto: PaginationDto) => isDefined(dto.page))
  @IsNumberString({ no_symbols: true })
  readonly page?: number

  @ApiProperty({ title: '条数限制', description: '条数限制' })
  @ValidateIf((dto: PaginationDto) => isDefined(dto.limit))
  @IsNumberString({ no_symbols: true })
  readonly limit?: number
}

export class DefaultOrderByDto {
  @ApiProperty({ enum: OrderByEnum, title: '创建时间', description: '创建时间排序' })
  @ValidateIf((dto: DefaultOrderByDto) => isDefined(dto.createdAt))
  @IsEnum(OrderByEnum)
  readonly createdAt?: OrderByEnum

  @ApiProperty({ enum: OrderByEnum, title: '更新时间', description: '更新时间排序' })
  @ValidateIf((dto: DefaultOrderByDto) => isDefined(dto.updatedAt))
  @IsEnum(OrderByEnum)
  readonly updatedAt?: OrderByEnum
}
