import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import compression from 'compression'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

const logger = new Logger('Bootstrap')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const isProduction = configService.get('isProduction')

  // CORS
  const allowedOrigins = configService.get('cors.origins') || []
  const corsOrigins = allowedOrigins.length ? allowedOrigins : [/^https?:\/\/localhost:\d+$/]

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(compression())

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      stopAtFirstError: true,
    }),
  )

  // API prefix
  app.setGlobalPrefix('v1')

  // Swagger (non-production only)
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Workshop API')
      .setDescription('API documentation for the workshop starter project')
      .setVersion('1.0')
      .addTag('items', 'Item management')
      .addTag('health', 'Health check')
      .build()

    const doc = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('docs', app, doc)
    logger.log('Swagger documentation available at /docs')
  }

  app.enableShutdownHooks()

  const port = configService.get('port')
  await app.listen(port)
  logger.log(`Workshop API running on port ${port}`)
}

bootstrap()
