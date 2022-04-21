import { Controller, Post, UseGuards, Param, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { Collection } from '@prisma/client'
import { JWTAuthGuard } from '@/auth/auth.guard'
import { RequestWithJWTUserDto } from '@/user/dto/user.dto'
import { TradeService } from './trade.service'
import { TradeBuyResultDto } from './dto/trade-buy.dto'

@ApiTags('交易')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @ApiOperation({ summary: '抢购藏品' })
  @ApiParam({ name: 'id', description: '藏品ID', type: 'string' })
  @Post('buy/:id')
  async buy(
    @Param('id')
    id: Collection['id'],
    @Request()
    { user }: RequestWithJWTUserDto
  ): Promise<TradeBuyResultDto> {
    return await this.tradeService.buyCollection(id, user.userId)
  }
}
