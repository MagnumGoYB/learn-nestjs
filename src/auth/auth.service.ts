import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JWTUserDto } from '@/user/dto/user.dto'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  sign(user: JWTUserDto) {
    const payload = { sub: user }
    return { accessToken: this.jwtService.sign(payload) }
  }
}
