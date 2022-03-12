import { Test, TestingModule } from '@nestjs/testing';
import { CartItem, Category, Product, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartItemFactory } from 'src/utils/factories/cart-item.factory';
import { CategoryFactory } from 'src/utils/factories/category.factory';
import { ProductFactory } from 'src/utils/factories/product.factory';
import { UserFactory } from 'src/utils/factories/user.factory';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let prisma: PrismaService;

  let userFactory: UserFactory;
  let categoryFactory: CategoryFactory;
  let productFactory: ProductFactory;
  let cartItemFactory: CartItemFactory;

  let createdUser: User;
  let createdCategories: Category[];
  let createdProducts: Product[];
  let createdcartItem: CartItem[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, PrismaService],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });
});
