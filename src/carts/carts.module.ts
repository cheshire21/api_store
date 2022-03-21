import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  imports: [AuthModule],
  controllers: [CartsController],
  providers: [CartsService, PrismaService, JwtAuthGuard, RolesGuard],
})
export class CartsModule {}
