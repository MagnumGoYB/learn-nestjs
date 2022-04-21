import Redis from 'ioredis'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Collection, ContractTypeEnum, Prisma, Stock } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import { GlobalConfigOptions } from '@/config'
import { JWTUserDto } from '@/user/dto/user.dto'
import { CollectionCreateResultDto } from './dto/collection-create.dto'
import { CollectionDto, ContractTypeEnumDto } from './dto/collection.dto'
import { QueryCollectionsDto } from './dto/collection-query.dto'

@Injectable()
export class CollectionService {
  private readonly seckillKeyPrefix: string

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redisClient: Redis,
    private readonly prismaService: PrismaService
  ) {
    this.seckillKeyPrefix = this.configService.get<GlobalConfigOptions>('global').seckillKeyPrefix
  }

  async createSeckillStock(collectionId: Collection['id'], stockQuantity: Stock['quantity']) {
    // 添加 Redis 秒杀库存
    const redisKey = `${this.seckillKeyPrefix}:${collectionId.toUpperCase()}`
    return await this.redisClient.hmset(redisKey, {
      collectionId,
      total: stockQuantity
    })
  }

  async deleteSeckillStock(collectionId: Collection['id']) {
    const redisKey = `${this.seckillKeyPrefix}:${collectionId.toUpperCase()}`
    return await this.redisClient.del(redisKey)
  }

  async returnSeckillStock(collectionId: Collection['id'], number?: number) {
    const redisKey = `${this.seckillKeyPrefix}:${collectionId.toUpperCase()}`
    return await this.redisClient.hincrby(redisKey, 'total', number ?? 1)
  }

  private updateById(id: Collection['id'], data: Prisma.CollectionUpdateInput) {
    return this.prismaService.collection.update({ where: { id }, data })
  }

  private deleteById(id: Collection['id']) {
    return this.updateById(id, { isDeleted: true }).then(async (collection) => {
      this.deleteSeckillStock(collection.id)
      return {
        ...collection,
        contractType: ContractTypeEnumDto[collection.contractType]
      }
    })
  }

  async userCreateCollection(
    data: Omit<Prisma.CollectionCreateInput, 'creator' | 'stock' | 'contractType'>,
    userId: JWTUserDto['userId'],
    contractType: ContractTypeEnumDto,
    quantity: Stock['quantity']
  ): Promise<CollectionCreateResultDto> {
    return await this.prismaService.collection
      .create({
        data: {
          ...data,
          contractType: ContractTypeEnum[contractType],
          creator: {
            connect: {
              id: userId
            }
          },
          stock: {
            create: {
              total: contractType === ContractTypeEnumDto.ERC_1155 ? quantity : 1,
              quantity: contractType === ContractTypeEnumDto.ERC_1155 ? quantity : 1
            }
          }
        },
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
              quantity: true,
              total: true
            }
          }
        }
      })
      .then(async (collection) => {
        const stockQuantity = contractType === ContractTypeEnumDto.ERC_1155 ? quantity : 1
        await this.createSeckillStock(collection.id, stockQuantity)
        return {
          ...collection,
          contractType: ContractTypeEnumDto[collection.contractType]
        }
      })
  }

  async getCollection(id: Collection['id']): Promise<CollectionDto> {
    const collection = await this.prismaService.collection.findFirst({
      where: { id, isDeleted: false },
      include: {
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
    })
    if (!collection) {
      throw new NotFoundException()
    }
    return {
      id: collection.id,
      title: collection.title,
      pricing: collection.pricing,
      contractType: ContractTypeEnumDto[collection.contractType],
      creator: collection.creator,
      stock: collection.stock
    }
  }

  async getCollections(query: QueryCollectionsDto): Promise<CollectionDto[]> {
    const { page = 1, limit = 10 } = query
    const skip = page > 1 ? page * limit : 0
    const take = limit
    const collections = await this.prismaService.collection
      .findMany({
        where: {
          isDeleted: false,
          title: {
            contains: query.title
          },
          creator: {
            name: {
              contains: query.creatorName
            }
          },
          creatorId: query.creatorId,
          contractType: ContractTypeEnum[query.contractType]
        },
        orderBy: {
          createdAt: Prisma.SortOrder[query.createdAt],
          updatedAt: Prisma.SortOrder[query.updatedAt],
          stock: {
            total: Prisma.SortOrder[query.stockTotal],
            quantity: Prisma.SortOrder[query.stockQuantity]
          }
        },
        include: {
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
          },
          owners: {
            include: {
              onwer: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        skip,
        take
      })
      .then((collections) => [
        ...collections.map((collection) => ({
          ...collection,
          contractType: ContractTypeEnumDto[collection.contractType]
        }))
      ])

    return collections.map((item) => ({
      id: item.id,
      title: item.title,
      pricing: item.pricing,
      contractType: item.contractType,
      creator: item.creator,
      stock: item.stock
    }))
  }

  async deleteCollectionWithCreator(id: Collection['id'], creatorId: Collection['creatorId']) {
    const collection = await this.prismaService.collection.findUnique({
      where: { id },
      select: {
        creatorId: true
      }
    })
    if (!collection) {
      throw new NotFoundException()
    }
    if (collection.creatorId !== creatorId) {
      throw new ForbiddenException()
    }
    await this.deleteById(id)
  }

  decrCollectionStock(id: Collection['id'], number?: number) {
    return this.updateById(id, {
      stock: {
        update: {
          quantity: {
            decrement: number ?? 1
          }
        }
      }
    })
  }

  incrCollectionStock(id: Collection['id'], number?: number) {
    return this.updateById(id, {
      stock: {
        update: {
          quantity: {
            increment: number ?? 1
          }
        }
      }
    })
  }
}
