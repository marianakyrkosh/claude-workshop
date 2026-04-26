import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PrismaService } from '../prisma/prisma.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let database = 'disconnected'
    try {
      await this.prisma.$queryRaw`SELECT 1`
      database = 'connected'
    } catch {
      database = 'disconnected'
    }

    return {
      status: database === 'connected' ? 'ok' : 'degraded',
      database,
    }
  }
}
