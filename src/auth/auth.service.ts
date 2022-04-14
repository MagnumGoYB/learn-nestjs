import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async sign(userId) {
    const payload = { sub: userId }
    return { accessToken: this.jwtService.sign(payload) }
  }
}
