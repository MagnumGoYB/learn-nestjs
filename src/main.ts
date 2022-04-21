import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {})

  app.use(helmet())

  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()

  const options = new DocumentBuilder()
    .setTitle('Learn NestJS API V1')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, options)

  SwaggerModule.setup('documents', app, document, {
    explorer: false
  })

  await app.listen(3000)
}

bootstrap()
