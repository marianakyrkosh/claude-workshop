import { Test, TestingModule } from '@nestjs/testing'
import { ItemsController } from './items.controller'
import { ItemsService } from './items.service'

const mockItem = {
  id: 'cuid123',
  title: 'Test Item',
  subtitle: null as string | null,
  description: 'Test description',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockItemsService = {
  create: jest.fn().mockResolvedValue(mockItem),
  findAll: jest.fn().mockResolvedValue({ data: [mockItem], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } }),
  findOne: jest.fn().mockResolvedValue(mockItem),
  update: jest.fn().mockResolvedValue(mockItem),
  remove: jest.fn().mockResolvedValue(mockItem),
}

describe('ItemsController', () => {
  let controller: ItemsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [{ provide: ItemsService, useValue: mockItemsService }],
    }).compile()

    controller = module.get<ItemsController>(ItemsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should create an item', async () => {
    const dto = { title: 'Test', description: 'Desc' }
    expect(await controller.create(dto)).toEqual(mockItem)
  })

  it('should create an item with a subtitle', async () => {
    const dto = { title: 'Test', subtitle: 'Tagline', description: 'Desc' }
    await controller.create(dto)
    expect(mockItemsService.create).toHaveBeenCalledWith(dto)
  })

  it('should return paginated items', async () => {
    const result = await controller.findAll({ page: 1, limit: 20 })
    expect(result.data).toEqual([mockItem])
  })

  it('should return a single item', async () => {
    expect(await controller.findOne('cuid123')).toEqual(mockItem)
  })

  it('should update an item', async () => {
    expect(await controller.update('cuid123', { title: 'Updated' })).toEqual(mockItem)
  })

  it('should update an item with a subtitle', async () => {
    const dto = { subtitle: 'New tagline' }
    await controller.update('cuid123', dto)
    expect(mockItemsService.update).toHaveBeenCalledWith('cuid123', dto)
  })

  it('should delete an item', async () => {
    expect(await controller.remove('cuid123')).toEqual(mockItem)
  })
})
