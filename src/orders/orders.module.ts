import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsModule } from 'src/products/products.module';
import { OrdersController } from './orders.controller';
import { OrdersResolver } from './resolvers/orders.resolver';
import { OrdersService } from './services/orders.service';
import { OrderItemResolver } from './resolvers/order-item.resolver';
import { UsersModule } from 'src/users/users.module';
import { OrderCreatedListener } from './listeners/order-created.listener';
import { FilesService } from 'src/common/services/file.service';
import { ConfigModule } from '@nestjs/config';
import { SendgridService } from '../common/services/send-emails.service';

@Module({
  imports: [AuthModule, UsersModule, ProductsModule, ConfigModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PrismaService,
    FilesService,
    SendgridService,
    JwtAuthGuard,
    RolesGuard,
    OrdersResolver,
    OrderItemResolver,
    OrderCreatedListener,
  ],
})
export class OrdersModule {}
