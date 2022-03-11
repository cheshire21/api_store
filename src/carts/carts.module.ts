import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  imports: [AuthModule],
  controllers: [CartsController],
  providers: [CartsService, PrismaService],
})
export class CartsModule {}
