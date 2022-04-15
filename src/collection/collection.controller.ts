import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  UnauthorizedException,
  Query,
  Delete
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { Collection } from '@prisma/client'
import { JWTAuthGuard } from '@/auth/auth.guard'
import { RequestWithJWTUserDto, UserRole } from '@/user/dto/user.dto'
import { CollectionService } from './collection.service'
import { CollectionCreateDto } from './dto/collection-create.dto'
import { GetCollectionsQueryDto } from './dto/collection.dto'

@ApiTags('Collection')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @ApiOperation({ summary: '创建藏品' })
  @ApiBody({
    type: CollectionCreateDto,
    examples: {
      'ERC-721': {
        value: {
          contractType: 'ERC_721',
          title: '数字藏品01',
          pricing: 100
        }
      },
      'ERC-1155': {
        value: {
          contractType: 'ERC_1155',
          title: '数字藏品01',
          pricing: 100,
          quantity: 10
        }
      }
    }
  })
  @Post()
  async create(
    @Request()
    { user }: RequestWithJWTUserDto,
    @Body()
    body: CollectionCreateDto
  ) {
    const { quantity, contractType, ...restBody } = body
    if (user.role !== UserRole.USER) {
      throw new UnauthorizedException()
    }
    return await this.collectionService.userCreateCollection(
      { ...restBody },
      user.userId,
      contractType,
      quantity
    )
  }

  @ApiOperation({ summary: '获取藏品信息' })
  @ApiParam({ name: 'id', description: '藏品ID', type: 'string' })
  @Get(':id')
  async getCollection(
    @Param('id')
    id: Collection['id']
  ) {
    return await this.collectionService.getCollection(id)
  }

  @ApiOperation({ summary: '获取藏品列表' })
  @Get()
  async getCollections(
    @Query()
    query: GetCollectionsQueryDto
  ) {
    return await this.collectionService.getCollections(query)
  }

  @ApiOperation({ summary: '删除藏品' })
  @ApiParam({ name: 'id', description: '藏品ID', type: 'string' })
  @Delete(':id')
  async deleteCollection(
    @Param('id')
    id: Collection['id']
  ) {
    return await this.collectionService.deleteCollection(id)
  }
}
