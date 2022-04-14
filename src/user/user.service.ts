import { Injectable } from '@nestjs/common'
import { User, Prisma } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({
      data: { ...data }
    })
  }

  async findOneById(id: User['id']): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { id }
    })
  }

  async findOneByPhone(phone: User['phone']): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { phone }
    })
  }
}
