import { ApiProperty, IntersectionType } from '@nestjs/swagger'
import { isDefined, IsEnum, IsString, MaxLength, ValidateIf } from 'class-validator'
import { Collection } from '@prisma/client'
import { DefaultOrderByDto, OrderByEnum, PaginationDto } from '@/app.dto'
import { ContractTypeEnumDto } from './collection.dto'

export class QueryCollectionsDto extends IntersectionType(PaginationDto, DefaultOrderByDto) {
  @ApiProperty({ title: '藏品名称', description: '藏品名称（模糊搜索）' })
  @ValidateIf((dto: QueryCollectionsDto) => isDefined(dto.title))
  @IsString()
  @MaxLength(20)
  readonly title?: string

  @ApiProperty({ title: '合约标准', description: '合约标准', enum: ContractTypeEnumDto })
  @ValidateIf((dto: QueryCollectionsDto) => isDefined(dto.contractType))
  @IsEnum(ContractTypeEnumDto)
  readonly contractType?: ContractTypeEnumDto

  @ApiProperty({ title: '创作者ID', description: '创作者ID' })
  @ValidateIf((dto: QueryCollectionsDto) => isDefined(dto.creatorId))
  @IsString()
  readonly creatorId?: Collection['creatorId']

  @ApiProperty({ title: '创作者昵称', description: '创作者昵称（模糊搜索）' })
  @ValidateIf((dto: QueryCollectionsDto) => isDefined(dto.creatorName))
  @IsString()
  @MaxLength(20)
  readonly creatorName?: string

  @ApiProperty({ enum: OrderByEnum, title: '总计发行数量', description: '总计发行数量排序' })
  @ValidateIf((dto: QueryCollectionsDto) => isDefined(dto.stockTotal))
  @IsEnum(OrderByEnum)
  readonly stockTotal?: OrderByEnum

  @ApiProperty({ enum: OrderByEnum, title: '库存剩余数量', description: '库存剩余数量排序' })
  @ValidateIf((dto: QueryCollectionsDto) => isDefined(dto.stockQuantity))
  @IsEnum(OrderByEnum)
  readonly stockQuantity?: OrderByEnum
}
