import { Injectable } from '@nestjs/common'
import { Collection, ContractTypeEnum, Prisma, Stock } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import { JWTUserDto } from '@/user/dto/user.dto'
import { CollectionCreateResultDto } from './dto/collection-create.dto'
import { CollectionDto, ContractTypeEnumDto, GetCollectionsQueryDto } from './dto/collection.dto'

@Injectable()
export class CollectionService {
  constructor(private readonly prismaService: PrismaService) {}

  private async findOneById(id: Collection['id']) {
    return await this.prismaService.collection
      .findFirst({
        rejectOnNotFound: true,
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
      .then((collection) => ({
        ...collection,
        contractType: ContractTypeEnumDto[collection.contractType]
      }))
  }

  private async updateById(id: Collection['id'], data: Prisma.CollectionUpdateInput) {
    return await this.prismaService.collection.update({ where: { id }, data })
  }

  private async deleteById(id: Collection['id']) {
    return await this.updateById(id, { isDeleted: true })
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
      .then((collection) => ({
        ...collection,
        contractType: ContractTypeEnumDto[collection.contractType]
      }))
  }

  async getCollection(id: Collection['id']): Promise<CollectionDto> {
    const collection = await this.findOneById(id)
    return {
      id: collection.id,
      title: collection.title,
      pricing: collection.pricing,
      contractType: collection.contractType,
      creator: collection.creator,
      stock: collection.stock
    }
  }

  async getCollections(query: GetCollectionsQueryDto): Promise<CollectionDto[]> {
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
          updatedAt: Prisma.SortOrder[query.updatedAt]
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

  async deleteCollection(id: Collection['id']) {
    return await this.deleteById(id)
  }
}
