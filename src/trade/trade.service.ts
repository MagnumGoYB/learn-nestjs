import Redis from 'ioredis'
import dayjs from 'dayjs'
import FlakeId from 'flake-idgen'
import intformat from 'biguint-format'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { OrderService } from '@/order/order.service'
import { Collection } from '@prisma/client'
import { JWTUserDto } from '@/user/dto/user.dto'
import { GlobalConfigOptions } from '@/config'
import { OrderPayWayEnumDto } from '@/order/dto/order.dto'
import { LockService } from '@/lock/lock.service'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class TradeService {
  private readonly logger = new Logger(TradeService.name)
  private readonly flakeIdGen = new FlakeId()
  private readonly seckillKeyPrefix: string
  private readonly orderSecondsDuration: number

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redisClient: Redis,
    private readonly orderService: OrderService,
    protected readonly lockService: LockService,
    protected readonly prismaService: PrismaService
  ) {
    this.seckillKeyPrefix = this.configService.get<GlobalConfigOptions>('global').seckillKeyPrefix
    this.orderSecondsDuration =
      this.configService.get<GlobalConfigOptions>('global').orderSecondsDuration
  }

  async buyCollection(id: Collection['id'], userId: JWTUserDto['userId']) {
    const collection = await this.prismaService.collection.findFirst({
      where: { id, isDeleted: false },
      include: {
        owners: {
          select: {
            onwerId: true
          }
        }
      }
    })

    if (collection.owners.some((item) => item.onwerId === userId)) {
      throw new BadRequestException(['collection is already owned'])
    }

    if (collection.creatorId === userId) {
      throw new BadRequestException(['collection is created by you'])
    }

    // 拿到藏品对应秒杀服务的 Redis Key
    const seckillKey = `${this.seckillKeyPrefix}:${id.toUpperCase()}`
    // 判断 Redis 中是否存在该藏品
    const hasCollectionSeckill = await this.redisClient.exists(seckillKey)
    if (!hasCollectionSeckill) {
      throw new BadRequestException(['collection not available for snap up'])
    }
    // 判断 Redis 中用户是否已有待支付订单
    const seckillOrderKey = this.orderService.getSeckillOrderKey(id, userId)
    const hasOrder = await this.redisClient.exists(seckillOrderKey)
    if (!!hasOrder) {
      throw new BadRequestException(['snap up is successfully, please complete the payment'])
    }

    // 判断库存数量
    const [stockTotal] = await this.redisClient.hmget(seckillKey, 'total')
    if (!stockTotal || +stockTotal <= 0) {
      throw new BadRequestException(['out of stock'])
    }

    const lockName = `${seckillKey}:USER:LOCK:${userId.toUpperCase()}`

    // 加锁
    const isLocked = await this.lockService.tryLock(lockName, this.orderSecondsDuration)
    try {
      if (isLocked) {
        // 加锁成功 下单
        const orderId = intformat(this.flakeIdGen.next(), 'dec')
        // 订单过期时间
        const expiredAt = +dayjs().add(this.orderSecondsDuration, 's')

        const stock = await this.redisClient.eval(
          `
            if (redis.call('hexists', KEYS[1], 'total') == 1) then
              local stock = tonumber(redis.call('hget', KEYS[1], 'total'));
              if (stock > 0) then
                if (redis.call('exists', KEYS[2]) == 0) then
                  redis.call('hset', KEYS[2], 'id', ARGV[1], 'payWay', ARGV[2], 'expiredAt', ARGV[3])
                  redis.call('expire', KEYS[2], ARGV[4]);
                  redis.call('hincrby', KEYS[1], 'total', -1);
                  return stock;
                end;
                return 0;
              end;
                return 0;
            end;
              return 0;
          `,
          2,
          seckillKey,
          seckillOrderKey,
          orderId,
          OrderPayWayEnumDto.ALIPAY,
          expiredAt,
          dayjs(expiredAt).unix() - dayjs().unix()
        )

        if (stock < 1) {
          throw new Error('out of stock')
        }

        // 队列 -> 创建实体订单任务
        await this.orderService.createOrderWithQueue(id, userId, {
          id: orderId,
          payWay: OrderPayWayEnumDto.ALIPAY,
          expiredAt: dayjs(expiredAt).toDate()
        })

        return {
          id: orderId,
          payWay: OrderPayWayEnumDto.ALIPAY,
          expiredAt
        }
      }
    } catch (error) {
      this.logger.debug(error)
      this.lockService.unlock(lockName)
      throw new BadRequestException(['failed snap, try again'])
    }
  }
}
