import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Category, Product, User } from '@prisma/client';
import { datatype } from 'faker';
import { CartItemFactory } from 'src/utils/factories/cart-item.factory';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryFactory } from '../utils/factories/category.factory';
import { ProductFactory } from '../utils/factories/product.factory';
import { UserFactory } from '../utils/factories/user.factory';
import { CartsService } from './carts.service';

describe('CartsService', () => {
  let cartsService: CartsService;
  let prisma: PrismaService;

  let userFactory: UserFactory;
  let productFactory: ProductFactory;
  let categoryFactory: CategoryFactory;
  let cartItemFactory: CartItemFactory;

  let categories: Category[];
  let categoriesLength: number = 2;
  let products: Product[] = [];
  let productstLength: number = 2;
  let createduser: User;
  let stock: number = 4;

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
    cartItemFactory = new CartItemFactory(prisma);

    categories = await categoryFactory.makeMany(categoriesLength);

    for (let i = 0; i < categoriesLength; i++) {
      const arr = await productFactory.makeMany(productstLength, {
        stock,
        category: {
          connect: {
            id: categories[i].id,
          },
        },
      });
      products.push(...arr);
    }

    createduser = await userFactory.make({});
  });

  describe('upsert', () => {
    it("should create a cart's item successfully", async () => {
      const pos = random(productstLength);

      const result = await cartsService.upsertItem(createduser.uuid, {
        productId: products[pos].uuid,
        quantity: stock,
      });
      expect(result).toHaveProperty('product');
      expect(result).toHaveProperty('quantity', stock);
      expect(result).toHaveProperty('unitPrice', products[pos].price);
      expect(result).toHaveProperty('totalPrice', products[pos].price * stock);
    });

    it("should return a error if quantity is out of product's stock range ", async () => {
      await expect(
        cartsService.upsertItem(createduser.uuid, {
          productId: products[random(productstLength)].uuid,
          quantity: 6,
        }),
      ).rejects.toThrow(
        new HttpException(
          'Quantity is bigger than stock',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it("should throw a error if user doesn't exist", async () => {
      await expect(
        cartsService.upsertItem(datatype.uuid(), {
          productId: products[random(productstLength)].uuid,
          quantity: stock,
        }),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it("should throw a error if product doesn't exist", async () => {
      await expect(
        cartsService.upsertItem(createduser.uuid, {
          productId: datatype.uuid(),
          quantity: stock,
        }),
      ).rejects.toThrow(
        new HttpException('Product not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('delete', () => {
    it("should create a cart's item successfully", async () => {
      const cart = await prisma.cart.findFirst({
        where: {
          userId: createduser.id,
        },
      });
      const cartitem = await cartItemFactory.make({
        cart: {
          connect: {
            id: cart.id,
          },
        },
        product: {
          connect: {
            id: products[random(productstLength)].id,
          },
        },
        quantity: datatype.number(),
        unitPrice: datatype.float(),
        totalPrice: datatype.float(),
      });
      const pos = random(productstLength);
      expect(
        await cartsService.delete(createduser.uuid, products[pos].uuid),
      ).toBeUndefined();
    });

    it("should throw a error if user doesn't exist", async () => {
      await expect(
        cartsService.delete(
          datatype.uuid(),
          products[random(productstLength)].uuid,
        ),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it("should throw a error if product doesn't exist", async () => {
      await expect(
        cartsService.delete(createduser.uuid, datatype.uuid()),
      ).rejects.toThrow(
        new HttpException('Product not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
