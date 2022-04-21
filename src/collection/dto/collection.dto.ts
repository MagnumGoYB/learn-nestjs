import { ApiProperty } from '@nestjs/swagger'
import { Collection, Stock } from '@prisma/client'
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
