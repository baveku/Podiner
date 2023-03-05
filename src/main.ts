import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { useContainer } from 'class-validator'
import { AppModule } from './app.module'
import validationOptions from './utils/validation-options'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { snapshot: true },
  )
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  const configService = app.get(ConfigService)
  const isProduction = configService.get('app.nodeEnv') === 'production'
  if (!isProduction) {
    app.useLogger(['log', 'debug'])
  }
  app.enableShutdownHooks()
  app.setGlobalPrefix(configService.get('app.apiPrefix'), {
    exclude: ['/'],
  })
  app.enableVersioning({
    type: VersioningType.URI,
  })
  app.useGlobalPipes(new ValidationPipe(validationOptions))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('docs', app, document)

  await app.listen(configService.get('app.port'))
}
void bootstrap()
