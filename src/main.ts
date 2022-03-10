import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  const config = new DocumentBuilder()
    .setTitle('Api Store')
    .setDescription('Api Store for products, carts and orders')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('products')
    .addTag('carts')
    .addTag('orders')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
