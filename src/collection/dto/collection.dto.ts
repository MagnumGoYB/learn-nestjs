import { ApiProperty, IntersectionType } from '@nestjs/swagger'
import { isDefined, IsEnum, IsString, MaxLength, ValidateIf } from 'class-validator'
import { Collection, Stock } from '@prisma/client'
import { DefaultOrderByDto, OrderByEnum, PaginationDto } from '@/app.dto'
import { UserDto } from '@/user/dto/user.dto'

export enum ContractTypeEnumDto {
  ERC_721 = 'ERC_721',
  ERC_1155 = 'ERC_1155'
}

export class CollectionStockDto {
  @ApiProperty({ title: '总计发行数量' })
  readonly total: Stock['total']

  @ApiProperty({ title: '库存剩余数量' })
  readonly quantity: Stock['quantity']
}

export class CollectionDto {
  @ApiProperty({ title: '藏品ID' })
  readonly id: Collection['id']

  @ApiProperty({ title: '藏品名称' })
  readonly title: Collection['title'] | null

  @ApiProperty({ title: '藏品价格' })
  readonly pricing: Collection['pricing']

  @ApiProperty({ title: '合约标准' })
  readonly contractType: ContractTypeEnumDto

  @ApiProperty({ title: '创作者' })
  readonly creator: UserDto

  @ApiProperty({ title: '库存' })
  readonly stock: CollectionStockDto
}

export class GetCollectionsQueryDto extends IntersectionType(PaginationDto, DefaultOrderByDto) {
  @ApiProperty({ title: '藏品名称', description: '藏品名称（模糊搜索）' })
  @ValidateIf((dto: GetCollectionsQueryDto) => isDefined(dto.title))
  @IsString()
  @MaxLength(20)
  readonly title?: string

  @ApiProperty({ title: '合约标准', description: '合约标准', enum: ContractTypeEnumDto })
  @ValidateIf((dto: GetCollectionsQueryDto) => isDefined(dto.contractType))
  @IsEnum(ContractTypeEnumDto)
  readonly contractType?: ContractTypeEnumDto

  @ApiProperty({ title: '创作者ID', description: '创作者ID' })
  @ValidateIf((dto: GetCollectionsQueryDto) => isDefined(dto.creatorId))
  @IsString()
  readonly creatorId?: Collection['creatorId']

  @ApiProperty({ title: '创作者昵称', description: '创作者昵称（模糊搜索）' })
  @ValidateIf((dto: GetCollectionsQueryDto) => isDefined(dto.creatorName))
  @IsString()
  @MaxLength(20)
  readonly creatorName?: string

  @ApiProperty({ enum: OrderByEnum, title: '总计发行数量', description: '总计发行数量排序' })
  @ValidateIf((dto: GetCollectionsQueryDto) => isDefined(dto.stockTotal))
  @IsEnum(OrderByEnum)
  readonly stockTotal?: OrderByEnum

  @ApiProperty({ enum: OrderByEnum, title: '库存剩余数量', description: '库存剩余数量排序' })
  @ValidateIf((dto: GetCollectionsQueryDto) => isDefined(dto.stockQuantity))
  @IsEnum(OrderByEnum)
  readonly stockQuantity?: OrderByEnum
}
