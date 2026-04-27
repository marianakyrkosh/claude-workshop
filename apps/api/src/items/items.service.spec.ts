import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { ItemsService } from './items.service'
import { PrismaService } from '../prisma/prisma.service'

const mockItem = {
  id: 'cuid123',
  title: 'Test Item',
  description: 'Test description',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockPrismaService = {
  item: {
    create: jest.fn().mockResolvedValue(mockItem),
    findMany: jest.fn().mockResolvedValue([mockItem]),
    findUnique: jest.fn().mockResolvedValue(mockItem),
    update: jest.fn().mockResolvedValue(mockItem),
    delete: jest.fn().mockResolvedValue(mockItem),
    count: jest.fn().mockResolvedValue(1),
  },
}

describe('ItemsService', () => {
  let service: ItemsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile()

    service = module.get<ItemsService>(ItemsService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create an item', async () => {
      const dto = { title: 'Test Item', description: 'Test description' }
      const result = await service.create(dto)
      expect(result).toEqual(mockItem)
      expect(mockPrismaService.item.create).toHaveBeenCalledWith({ data: dto })
    })
  })

  describe('findAll', () => {
    it('should return paginated items', async () => {
      const result = await service.findAll({ page: 1, limit: 20 })
      expect(result.data).toEqual([mockItem])
      expect(result.meta.total).toBe(1)
    })
  })

  describe('findOne', () => {
    it('should return an item by id', async () => {
      const result = await service.findOne('cuid123')
      expect(result).toEqual(mockItem)
    })

    it('should throw NotFoundException if item not found', async () => {
      mockPrismaService.item.findUnique.mockResolvedValueOnce(null)
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update an item', async () => {
      const dto = { title: 'Updated' }
      const result = await service.update('cuid123', dto)
      expect(result).toEqual(mockItem)
      expect(mockPrismaService.item.update).toHaveBeenCalledWith({
        where: { id: 'cuid123' },
        data: dto,
      })
    })
  })

  describe('remove', () => {
    it('should delete an item', async () => {
      const result = await service.remove('cuid123')
      expect(result).toEqual(mockItem)
      expect(mockPrismaService.item.delete).toHaveBeenCalledWith({
        where: { id: 'cuid123' },
      })
    })
  })
})
