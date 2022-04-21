import Redis from 'ioredis'
import { Job } from 'bull'
import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { PrismaService } from '@/prisma/prisma.service'
import { CollectionService } from '@/collection/collection.service'
import { OrderService } from './order.service'

@Processor('ORDER')
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name)

  constructor(
    private readonly orderService: OrderService,
    private readonly collectionService: CollectionService,
    private readonly prismaService: PrismaService,
    @InjectRedis() private readonly redisClient: Redis
  ) {}

  @Process('create')
  async handleCreate(job: Job<Prisma.OrderUncheckedCreateInput>) {
    this.logger.debug('实体订单入库任务开始...', job.data)
    const { collectionId, ownerId, ...data } = job.data
    // 检查 Redis 订单是否未过期 决定实体订单状态是否为 INVALID
    const isNotExpired = await this.redisClient.exists(
      this.orderService.getSeckillOrderKey(collectionId, ownerId)
    )
    // 事务 -> 创建实体订单、扣实体库存
    // 创建实体订单
    const createOrder = this.orderService.create(
      { ...data, status: isNotExpired ? 'PENDING' : 'INVALID' },
      collectionId,
      ownerId
    )
    // 扣藏品实体库存
    const decrCollectionStock = this.collectionService.decrCollectionStock(collectionId)

    try {
      await this.prismaService.$transaction([createOrder, decrCollectionStock])
      this.logger.debug('实体订单入库任务完成')
    } catch (error) {
      this.logger.debug(error)
    }
  }

  @Process('expire')
  async handleExpire(job: Job<Prisma.OrderUncheckedCreateInput>) {
    this.logger.debug('队列订单自动过期开始...')
    this.logger.debug(job.data)

    const { collectionId, ownerId, id } = job.data
    // 检查 Redis 订单是否未过期
    const isRedisExpired = await this.redisClient.exists(
      this.orderService.getSeckillOrderKey(collectionId, ownerId)
    )
    if (!isRedisExpired) {
      // 如果 Redis 订单还未过期 重试任务
      job.moveToFailed({ message: 'Redis 订单未失效，重新执行任务' })
      job.retry()
      return
    }

    try {
      // 返还藏品实体库存
      const incrCollectionStock = this.collectionService.incrCollectionStock(collectionId)
      // 设置实体订单状态为 INVALID 已过期
      const setOrderToInvalid = this.orderService.updateOrderStatus(id, 'INVALID')
      await this.prismaService.$transaction([incrCollectionStock, setOrderToInvalid])
      // 返还 Redis 库存
      await this.collectionService.returnSeckillStock(collectionId)

      this.logger.debug('队列订单自动过期开始完成')
    } catch (error) {
      this.logger.debug(error)
    }
  }
}
