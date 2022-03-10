import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  controllers: [CartsController],
  providers: [CartsService, PrismaService],
})
export class CartsModule {}
