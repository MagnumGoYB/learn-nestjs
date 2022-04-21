import { Module } from '@nestjs/common'
import { PrismaModule } from '@/prisma/prisma.module'
import { OrderModule } from '@/order/order.module'
import { TradeService } from './trade.service'
import { TradeController } from './trade.controller'

@Module({
  imports: [PrismaModule, OrderModule],
  controllers: [TradeController],
  providers: [TradeService]
})
export class TradeModule {}
