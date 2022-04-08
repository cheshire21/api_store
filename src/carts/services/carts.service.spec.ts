import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartItem, Category, Product, User } from '@prisma/client';
import { datatype } from 'faker';
import { CartItemFactory } from '../factories/cart-item.factory';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryFactory } from '../../products/factories/category.factory';
import { ProductFactory } from '../../products/factories/product.factory';
import { UserFactory } from '../../users/factories/user.factory';
import { CartsService } from './carts.service';

describe('CartsService', () => {
  let cartsService: CartsService;
  let prisma: PrismaService;

  let userFactory: UserFactory;
  let productFactory: ProductFactory;
  let categoryFactory: CategoryFactory;
  let cartItemFactory: CartItemFactory;

  let categories: Category[];
  const categoriesLength = 2;
  let products: Product[] = [];
  const productstLength = 2;
  let createduser: User;
  const stock = 4;

  const random = (length) => Math.floor(Math.random() * length);

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

    createduser = await userFactory.make({});
  });

  beforeEach(async () => {
    products = [];
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
  });

  afterAll(async () => {
    await prisma.clearDB();
    await prisma.$disconnect();
  });

  describe('getCart', () => {
    it('should return a empty list', async () => {
      const result = await cartsService.getItems(createduser.uuid);

      expect(result).toHaveProperty('items', expect.any(Array));
      expect(result.items).toHaveLength(0);
      expect(result).toHaveProperty('totalPrice', expect.any(Number));
      expect(result).toHaveProperty('updatedAt', expect.any(Date));
      expect(result).toHaveProperty('createdAt', expect.any(Date));
    });
    it("should return a list of products in user's cart", async () => {
      const cart = await prisma.cart.findFirst({
        where: {
          userId: createduser.id,
        },
      });

      const cartItems: CartItem[] = [];
      for (let i = 0; i < productstLength; i++) {
        const newcartItem = await cartItemFactory.make({
          cart: {
            connect: {
              id: cart.id,
            },
          },
          product: {
            connect: {
              id: products[i].id,
            },
          },
          quantity: datatype.number(),
          unitPrice: datatype.float(),
          totalPrice: datatype.float(),
        });
        cartItems.push(newcartItem);
      }

      const result = await cartsService.getItems(createduser.uuid);

      expect(result).toHaveProperty('items', expect.any(Array));
      expect(result.items).toHaveLength(productstLength);
      expect(result).toHaveProperty('totalPrice', expect.any(Number));
      expect(result).toHaveProperty('updatedAt', expect.any(Date));
      expect(result).toHaveProperty('createdAt', expect.any(Date));
    });

    it("should throw a error if user doesn't exist", async () => {
      await expect(cartsService.getItems(datatype.uuid())).rejects.toThrow();
    });
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
        new BadRequestException('Quantity is bigger than stock'),
      );
    });

    it("should throw a error if user doesn't exist", async () => {
      await expect(
        cartsService.upsertItem(datatype.uuid(), {
          productId: products[random(productstLength)].uuid,
          quantity: stock,
        }),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it("should throw a error if product doesn't exist", async () => {
      await expect(
        cartsService.upsertItem(createduser.uuid, {
          productId: datatype.uuid(),
          quantity: stock,
        }),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });

    it('should return a error if product is disable', async () => {
      const pos = random(productstLength);
      await prisma.product.update({
        where: {
          id: products[pos].id,
        },
        data: {
          status: false,
          deletedAt: new Date(),
        },
      });

      await expect(
        cartsService.upsertItem(createduser.uuid, {
          productId: products[pos].uuid,
          quantity: 5,
        }),
      ).rejects.toThrow(
        new UnauthorizedException('Product is in disable status'),
      );
    });
  });

  describe('delete', () => {
    it("should create a cart's item successfully", async () => {
      const pos = random(categoriesLength);

      const cart = await prisma.cart.findFirst({
        where: {
          userId: createduser.id,
        },
      });

      const createdProd = await productFactory.make({
        stock,
        category: {
          connect: {
            id: categories[pos].id,
          },
        },
      });

      await cartItemFactory.make({
        cart: {
          connect: {
            id: cart.id,
          },
        },
        product: {
          connect: {
            id: createdProd.id,
          },
        },
        quantity: datatype.number(),
        unitPrice: datatype.float(),
        totalPrice: datatype.float(),
      });

      expect(
        await cartsService.delete(createduser.uuid, createdProd.uuid),
      ).toBe(true);
    });

    it("should throw a error if user doesn't exist", async () => {
      await expect(
        cartsService.delete(
          datatype.uuid(),
          products[random(productstLength)].uuid,
        ),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it("should throw a error if product doesn't exist", async () => {
      await expect(
        cartsService.delete(createduser.uuid, datatype.uuid()),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });
  });
});
