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
import { OrderCreatedListener } from './listeners/order-created.listener';
import { SendEmailsModule } from 'src/send-emails/send-emails.module';
import { FilesService } from 'src/files/file.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProductsModule,
    SendEmailsModule,
    ConfigModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PrismaService,
    FilesService,
    JwtAuthGuard,
    RolesGuard,
    OrdersResolver,
    OrderItemResolver,
    OrderCreatedListener,
  ],
})
export class OrdersModule {}
