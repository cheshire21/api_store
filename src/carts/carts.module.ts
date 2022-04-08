import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ProductsModule } from 'src/products/products.module';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartsService } from './services/carts.service';
import { CartsResolver } from './resolvers/carts.resolver';
import { CartsController } from './carts.controller';
import { CartItemsResolver } from './resolvers/cart-item.resolver';

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
