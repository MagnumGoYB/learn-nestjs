import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { PrismaModule } from '@/prisma/prisma.module'
import { CollectionService } from '@/collection/collection.service'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { OrderProcessor } from './order.processor'

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'QUEUE:ORDER',
      settings: {
        stalledInterval: 3000,
        maxStalledCount: 10
      }
    })
  ],
  controllers: [OrderController],
  providers: [OrderService, CollectionService, OrderProcessor],
  exports: [OrderService]
})
export class OrderModule {}
