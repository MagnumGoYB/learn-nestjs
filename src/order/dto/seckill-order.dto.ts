import { ApiProperty } from '@nestjs/swagger'
import { Order } from '@prisma/client'
import { OrderPayWayEnumDto } from './order.dto'

export class SeckillOrderDto {
  @ApiProperty({ title: '订单编号' })
  readonly id: Order['id']

  @ApiProperty({ title: '支付方式' })
  readonly payWay: OrderPayWayEnumDto

  @ApiProperty({ title: '订单过期时间' })
  readonly expiredAt: Order['expiredAt']
}
