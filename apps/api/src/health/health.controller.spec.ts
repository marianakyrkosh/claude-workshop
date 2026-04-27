import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'
import { PrismaService } from '../prisma/prisma.service'

describe('HealthController', () => {
  let controller: HealthController

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: mockPrismaService }],
    }).compile()

    controller = module.get<HealthController>(HealthController)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return ok when database is connected', async () => {
    mockPrismaService.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }])
    const result = await controller.check()
    expect(result).toEqual({ status: 'ok', database: 'connected' })
  })

  it('should return degraded when database is disconnected', async () => {
    mockPrismaService.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'))
    const result = await controller.check()
    expect(result).toEqual({ status: 'degraded', database: 'disconnected' })
  })
})
