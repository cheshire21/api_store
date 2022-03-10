import { Test, TestingModule } from '@nestjs/testing';
import { Category, Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryFactory } from 'src/utils/factories/category.factory';
import { ProductFactory } from 'src/utils/factories/product.factory';
import { UserFactory } from 'src/utils/factories/user.factory';
import { CartsService } from './carts.service';

describe('CartsService', () => {
  let cartsService: CartsService;
  let prisma: PrismaService;

  let userFactory: UserFactory;
  let productFactory: ProductFactory;
  let categoryFactory: CategoryFactory;

  let categories: Category[];
  let categoriesLength: number = 3;
  let products: Product[];
  let productstLength: number = 5;

  let random = (length) => Math.floor(Math.random() * length);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartsService, PrismaService],
    }).compile();

    cartsService = module.get<CartsService>(CartsService);
    prisma = module.get<PrismaService>(PrismaService);

    userFactory = new UserFactory(prisma);
    productFactory = new ProductFactory(prisma);
    categoryFactory = new CategoryFactory(prisma);

    categories = await categoryFactory.makeMany(length);

    for (let i = 0; i < categoriesLength; i++) {
      const arr = await productFactory.makeMany(productstLength, {
        category: {
          connect: {
            id: categories[i].id,
          },
        },
      });
      products.push(...arr);
    }
  });

  describe('create', () => {});

  describe('update', () => {});

  describe('delete', () => {});
});
