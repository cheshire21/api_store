import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { config } from 'aws-sdk';

import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const prismaService: PrismaService = app.get(PrismaService);

  prismaService.enableShutdownHook(app);

  const configService = app.get(ConfigService);
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION'),
  });

  const config1 = new DocumentBuilder()
    .setTitle('Api Store')
    .setDescription('Api Store for products, carts and orders')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('products')
    .addTag('cart')
    .addTag('orders')
    .build();

  const document = SwaggerModule.createDocument(app, config1);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
