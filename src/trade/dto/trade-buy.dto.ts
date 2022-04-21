import { ApiProperty, OmitType } from '@nestjs/swagger'
import { SeckillOrderDto } from '@/order/dto/seckill-order.dto'

export class TradeBuyResultDto extends OmitType(SeckillOrderDto, ['expiredAt']) {
  @ApiProperty({ title: '订单过期时间' })
  readonly expiredAt: number
}
