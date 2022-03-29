import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsModule } from 'src/products/products.module';
import { OrdersController } from './orders.controller';
import { OrdersResolver } from './resolvers/orders.resolver';
import { OrdersService } from './orders.service';
import { OrderItemResolver } from './resolvers/order-item.resolver';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [AuthModule, UsersModule, ProductsModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PrismaService,
    JwtAuthGuard,
    RolesGuard,
    OrdersResolver,
    OrderItemResolver,
  ],
})
export class OrdersModule {}
