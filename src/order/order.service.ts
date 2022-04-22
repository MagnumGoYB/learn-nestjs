import Redis from 'ioredis'
import { Queue } from 'bull'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { ConfigService } from '@nestjs/config'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { PrismaService } from '@/prisma/prisma.service'
import { Collection, Order, Prisma } from '@prisma/client'
import { ContractTypeEnumDto } from '@/collection/dto/collection.dto'
import { GlobalConfigOptions } from '@/config'
import { OrderDto, OrderPayWayEnumDto } from './dto/order.dto'
import { SeckillOrderDto } from './dto/seckill-order.dto'
import { JWTUserDto } from '@/user/dto/user.dto'

@Injectable()
export class OrderService {
  private readonly seckillKeyPrefix: string

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redisClient: Redis,
    private readonly prismaService: PrismaService,
    @InjectQueue('QUEUE:ORDER') private readonly orderQueue: Queue<Prisma.OrderUncheckedCreateInput>
  ) {
    this.seckillKeyPrefix = this.configService.get<GlobalConfigOptions>('global').seckillKeyPrefix
  }

  getSeckillOrderKey(collectionId: Collection['id'], userId: JWTUserDto['userId']) {
    return `${
      this.seckillKeyPrefix
    }:${collectionId.toUpperCase()}:USER:ORDER:${userId.toUpperCase()}`
  }

  // 创建 Redis 秒杀订单
  async createSeckillOrder(
    collectionId: Collection['id'],
    userId: JWTUserDto['userId'],
    data: SeckillOrderDto
  ) {
    return this.redisClient.hmset(this.getSeckillOrderKey(collectionId, userId), data)
  }

  // 查询 Redis 秒杀订单
  async findSeckillOrder(collectionId: Collection['id'], userId: JWTUserDto['userId']) {
    return (await this.redisClient.hgetall(
      this.getSeckillOrderKey(collectionId, userId)
    )) as Record<string, string> & SeckillOrderDto
  }

  // 删除 Redis 秒杀订单
  async deleteSeckillOrder(collectionId: Collection['id'], userId: JWTUserDto['userId']) {
    return await this.redisClient.del(this.getSeckillOrderKey(collectionId, userId))
  }

  // 队列 -> 创建实体订单任务
  createOrderWithQueue(
    collectionId: Collection['id'],
    ownerId: JWTUserDto['userId'],
    data: SeckillOrderDto
  ) {
    return this.orderQueue.add(
      'create',
      { ...data, collectionId, ownerId },
      { removeOnComplete: true }
    )
  }

  // 创建订单
  create(
    data: Omit<Prisma.OrderCreateInput, 'paidAt' | 'collection' | 'owner'>,
    collectionId: Order['collectionId'],
    ownerId: Order['ownerId']
  ) {
    return this.prismaService.order.create({
      data: {
        ...data,
        collection: {
          connect: {
            id: collectionId
          }
        },
        owner: {
          connect: {
            id: ownerId
          }
        }
      },
      select: {
        id: true,
        status: true,
        payWay: true,
        expiredAt: true,
        collection: {
          select: {
            id: true,
            title: true,
            stock: {
              select: {
                quantity: true,
                total: true
              }
            }
          }
        },
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  async findOwnerOrder(collectionId: Order['collectionId'], ownerId: Order['ownerId']) {
    return await this.prismaService.order.findFirst({
      where: { collectionId, ownerId, isDeleted: false },
      include: {
        collection: {
          select: {
            id: true,
            title: true,
            pricing: true,
            stock: {
              select: {
                total: true,
                quantity: true
              }
            }
          }
        }
      }
    })
  }

  async getOrder(id: Order['id']): Promise<OrderDto> {
    const order = await this.prismaService.order.findFirst({
      where: { id, isDeleted: false },
      include: {
        owner: {
          select: {
            id: true,
            name: true
          }
        },
        collection: {
          select: {
            id: true,
            title: true,
            pricing: true,
            contractType: true,
            creator: {
              select: {
                id: true,
                name: true
              }
            },
            stock: {
              select: {
                total: true,
                quantity: true
              }
            }
          }
        }
      }
    })
    if (!order) {
      throw new NotFoundException()
    }
    return {
      id: order.id,
      collection: {
        ...order.collection,
        contractType: ContractTypeEnumDto[order.collection.contractType]
      },
      payWay: OrderPayWayEnumDto[order.payWay],
      owner: order.owner
    }
  }

  updateOrderStatus(id: Order['id'], status: Order['status']) {
    return this.prismaService.order.update({
      where: { id },
      data: { status }
    })
  }
}
