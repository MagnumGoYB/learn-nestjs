import { ApiProperty } from '@nestjs/swagger'
import { User } from '@prisma/client'

export enum UserRole {
  USER,
  ADMIN
}

export class UserDto {
  @ApiProperty({ title: '用户ID' })
  id: User['id']

  @ApiProperty({ title: '昵称' })
  name: User['name'] | null
}

export class JWTUserDto {
  @ApiProperty({ title: '用户ID' })
  readonly userId: User['id']

  @ApiProperty({ title: '用户角色' })
  readonly role: UserRole
}

export class RequestWithJWTUserDto {
  @ApiProperty({ title: '令牌用户' })
  readonly user: JWTUserDto
}
