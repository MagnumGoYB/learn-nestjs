import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { UserModule } from '@/user/user.module'
import { AuthService } from './auth.service'
import { SecretKey } from './constants'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: SecretKey,
      signOptions: { expiresIn: '10h' }
    })
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
