import Redis from 'ioredis'
import dayjs from 'dayjs'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { OrderService } from '@/order/order.service'
import { Collection } from '@prisma/client'
import { JWTUserDto } from '@/user/dto/user.dto'
import { GlobalConfigOptions } from '@/config'
import { OrderPayWayEnumDto } from '@/order/dto/order.dto'

@Injectable()
export class TradeService {
  private readonly logger = new Logger(TradeService.name)
  private readonly seckillKeyPrefix: string
  private readonly orderSecondsDuration: number

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redisClient: Redis,
    private readonly orderService: OrderService
  ) {
    this.seckillKeyPrefix = this.configService.get<GlobalConfigOptions>('global').seckillKeyPrefix
    this.orderSecondsDuration =
      this.configService.get<GlobalConfigOptions>('global').orderSecondsDuration
  }

  async buyCollection(id: Collection['id'], userId: JWTUserDto['userId']) {
    // 拿到藏品对应秒杀服务的 Redis Key
    const seckillRedisKey = `${this.seckillKeyPrefix}:${id.toUpperCase()}`
    // 判断 Redis 中是否存在该藏品
    const hasCollectionSeckill = await this.redisClient.exists(seckillRedisKey)
    if (!hasCollectionSeckill) {
      throw new BadRequestException(['collection not available for snap up'])
    }
    // 判断 Redis 中用户是否已有待支付订单
    const hasOrder = await this.redisClient.exists(
      `${seckillRedisKey}:USER:${userId.toUpperCase()}:ORDER`
    )
    if (!!hasOrder) {
      throw new BadRequestException(['snap up is successfully, please complete the payment'])
    }

    // 判断库存数量
    const [stockTotal] = await this.redisClient.hmget(seckillRedisKey, 'total')
    if (!stockTotal || +stockTotal <= 0) {
      throw new BadRequestException(['out of stock'])
    }
    // 下单操作 保证原子性
    try {
      // Redis 乐观锁 扣库存
      await this.redisClient.watch(seckillRedisKey)
      await this.redisClient.multi({ pipeline: false })
      // 生成 OrderId [Date + 5位随机数]
      const orderId =
        dayjs().format('YYYYMMDDHHmmss') +
        Math.floor(Math.random() * 99999)
          .toString()
          .padStart(5, '0')

      // 订单过期时间
      const expiredAt = dayjs().add(this.orderSecondsDuration, 's').toDate()

      const newOrderData = {
        id: orderId,
        payWay: OrderPayWayEnumDto.ALIPAY,
        expiredAt
      }

      await this.orderService.createSeckillOrder(id, userId, newOrderData)
      await this.redisClient.expireat(
        this.orderService.getSeckillOrderKey(id, userId),
        dayjs(expiredAt).unix()
      )
      await this.redisClient.hincrby(seckillRedisKey, 'total', -1)
      await this.redisClient.exec()
      await this.redisClient.unwatch()

      const seckillOrder = await this.orderService.findSeckillOrder(id, userId)

      this.logger.debug('抢购成功', seckillOrder)

      // 队列 -> 创建实体订单任务
      await this.orderService.createOrderWithQueue(id, userId, newOrderData)

      return { ...seckillOrder, expiredAt: +dayjs(seckillOrder.expiredAt) }
    } catch (error) {
      this.logger.debug(error)
      await this.redisClient.unwatch()
      throw new BadRequestException(['failed snap, try again'])
    }
  }
}
