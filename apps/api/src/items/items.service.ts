import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { PaginationDto } from '../common/dto/pagination.dto'
import { paginate } from '../common/dto/paginated-response.dto'

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateItemDto) {
    return this.prisma.item.create({ data: dto })
  }

  async findAll(pagination: PaginationDto) {
    return paginate(this.prisma.item, { orderBy: { createdAt: 'desc' } }, pagination)
  }

  async findOne(id: string) {
    const item = await this.prisma.item.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException(`Item with ID "${id}" not found`)
    }
    return item
  }

  async update(id: string, dto: UpdateItemDto) {
    await this.findOne(id)
    return this.prisma.item.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.item.delete({ where: { id } })
  }
}
