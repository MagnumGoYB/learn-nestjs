import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { SmsModule } from './sms/sms.module'
import { UserModule } from './user/user.module'
import { CollectionModule } from './collection/collection.module'
import RedisConfig from './config/redis.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [RedisConfig]
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService]
    }),
    AuthModule,
    UserModule,
    SmsModule,
    CollectionModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
