import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { CartsResolver } from './carts.resolver';
import { CartItemsResolver } from './cart-item.resolver';
import { ProductsService } from 'src/products/products.service';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [CartsController],
  providers: [
    CartsService,
    PrismaService,
    JwtAuthGuard,
    RolesGuard,
    CartsResolver,
    CartItemsResolver,
  ],
})
export class CartsModule {}
