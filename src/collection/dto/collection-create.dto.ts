import { ApiProperty } from '@nestjs/swagger'
import { Collection, Stock } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, MaxLength, ValidateIf } from 'class-validator'
import { CollectionDto, ContractTypeEnumDto } from './collection.dto'

export class CollectionCreateDto {
  @ApiProperty({ title: '藏品名称' })
  @IsNotEmpty()
  @MaxLength(20)
  readonly title: Collection['title']

  @ApiProperty({ title: '藏品价格', description: '单位：元', default: 100 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  readonly pricing: Collection['pricing']

  @ApiProperty({ title: '合约标准', description: 'ERC-721 不可设置发行数量' })
  @IsEnum(ContractTypeEnumDto)
  readonly contractType: ContractTypeEnumDto

  @ApiProperty({ title: '发行数量', description: '合约标准为 ERC-1155 时必传' })
  @ValidateIf(
    (dto: CollectionCreateDto) =>
      ContractTypeEnumDto[dto.contractType] === ContractTypeEnumDto.ERC_1155
  )
  @IsNotEmpty()
  @IsPositive()
  readonly quantity?: Stock['quantity']
}

export class CollectionCreateResultDto extends CollectionDto {}
