import { ApiProperty } from '@nestjs/swagger'
import { Order } from '@prisma/client'
import { UserDto } from '@/user/dto/user.dto'
import { CollectionDto } from '@/collection/dto/collection.dto'

export enum OrderPayWayEnumDto {
  ALIPAY = 'ALIPAY',
  WECHATPAY = 'WECHATPAY'
}

export class OrderDto {
  @ApiProperty({ title: '订单编号' })
  readonly id: Order['id']

  @ApiProperty({ title: '订单所属用户' })
  readonly owner: UserDto

  @ApiProperty({ title: '所属藏品' })
  readonly collection: CollectionDto

  @ApiProperty({ title: '支付方式' })
  readonly payWay: OrderPayWayEnumDto
}
