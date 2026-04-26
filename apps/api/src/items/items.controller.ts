import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ItemsService } from './items.service'
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  create(@Body() dto: CreateItemDto) {
    return this.itemsService.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'List all items (paginated)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.itemsService.findAll(pagination)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an item' })
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item' })
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id)
  }
}
