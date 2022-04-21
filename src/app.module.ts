import { APP_GUARD } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule } from '@nestjs/bull'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { RateLimiterGuard, RateLimiterModule } from 'nestjs-rate-limiter'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { SmsModule } from './sms/sms.module'
import { UserModule } from './user/user.module'
import { CollectionModule } from './collection/collection.module'
import { TradeModule } from './trade/trade.module'
import { OrderModule } from './order/order.module'
import GlobalConfig, { RedisConfig, RateLimiterConfig } from './config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [GlobalConfig, RateLimiterConfig, RedisConfig]
    }),
    RateLimiterModule.registerAsync({
      useFactory: (configService: ConfigService) => configService.get('rate-limiter'),
      inject: [ConfigService]
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService]
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: configService.get('redis').config,
        prefix: configService.get('redis').config.keyPrefix
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    UserModule,
    SmsModule,
    CollectionModule,
    TradeModule,
    OrderModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard
    }
  ]
})
export class AppModule {}
