import { Module } from '@nestjs/common'
import { PrismaModule } from '@/prisma/prisma.module'
import { OrderModule } from '@/order/order.module'
import { LockService } from '@/lock/lock.service'
import { TradeService } from './trade.service'
import { TradeController } from './trade.controller'

@Module({
  imports: [PrismaModule, OrderModule],
  controllers: [TradeController],
  providers: [TradeService, LockService]
})
export class TradeModule {}
