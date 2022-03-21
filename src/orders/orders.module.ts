import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, JwtAuthGuard, RolesGuard],
})
export class OrdersModule {}
