import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cart, Category, User } from '@prisma/client';
import { datatype } from 'faker';
import { Role } from '../../common/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CartItemFactory } from '../../carts/factories/cart-item.factory';
import { CategoryFactory } from '../../products/factories/category.factory';
import { ProductFactory } from '../../products/factories/product.factory';
import { UserFactory } from '../../users/factories/user.factory';
import { OrdersService } from './orders.service';
import { OrderItemFactory } from '../factories/order-item.factory';
import { EventEmitter2 } from '@nestjs/event-emitter';

const MockEventEmitter2 = () => ({
  emit: jest.fn(),
});

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let prisma: PrismaService;

  let userFactory: UserFactory;
  let categoryFactory: CategoryFactory;
  let productFactory: ProductFactory;
  let cartItemFactory: CartItemFactory;
  let orderItemFactory: OrderItemFactory;
  let createdUser: User;
  let createdCategories: Category[];
  const categoryLength = 2;
  const productsLength = 3;
  let createdCart: Cart;
  let idproducts = [];
  const stock = 5;
  const price = 51;
  let eventEmitter2;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        PrismaService,
        {
          provide: EventEmitter2,
          useFactory: MockEventEmitter2,
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter2 = module.get<EventEmitter2>(EventEmitter2);

    userFactory = new UserFactory(prisma);
    categoryFactory = new CategoryFactory(prisma);
    productFactory = new ProductFactory(prisma);
    cartItemFactory = new CartItemFactory(prisma);
    orderItemFactory = new OrderItemFactory(prisma);

    createdCategories = await categoryFactory.makeMany(categoryLength);
  });

  beforeEach(async () => {
    createdUser = await userFactory.make();

    createdCart = await prisma.cart.findFirst({
      where: {
        userId: createdUser.id,
      },
    });

    idproducts = [];

    for (let i = 0; i < categoryLength; i++) {
      const arr = await productFactory.makeMany(productsLength, {
        stock,
        category: {
          connect: {
            id: createdCategories[i].id,
          },
        },
      });

      idproducts.push(
        ...arr.map((prod) => {
          return {
            connect: {
              id: prod.id,
            },
          };
        }),
      );
    }
  });

  afterAll(async () => {
    await prisma.clearDB();
    await prisma.$disconnect();
  });
  describe('getOrders', () => {
    const createdOrder = async () => {
      const order = await prisma.order.create({
        data: {
          userId: createdUser.id,
          totalPrice: 0,
        },
      });

      await orderItemFactory.makeMany(
        categoryLength * productsLength,
        {
          order: {
            connect: {
              id: order.id,
            },
          },
          product: null,
          quantity: stock,
          unitPrice: price,
          totalPrice: stock * price,
        },
        idproducts,
      );

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          totalPrice: categoryLength * productsLength * stock * price,
        },
      });
    };

    it("should return only user's orders if user's role is client", async () => {
      await createdOrder();

      const result = await ordersService.getMany(createdUser, {
        take: 5,
        page: 1,
      });

      expect(result).toHaveProperty('orders', expect.any(Array));
      expect(result).toHaveProperty('pagination', expect.any(Object));
    });

    it("should return a list of clients with their orders if user's role is manager", async () => {
      createdUser = await prisma.user.update({
        where: { id: createdUser.id },
        data: { role: Role.manager },
      });

      const result = await ordersService.getMany(createdUser, {
        take: 5,
        page: 1,
      });

      expect(result).toHaveProperty('orders', expect.any(Array));
      expect(result).toHaveProperty('pagination', expect.any(Object));
    });

    it('should return a empty list', async () => {
      const result = await ordersService.getMany(createdUser, {
        take: 5,
        page: 1,
      });

      expect(result).toHaveProperty('orders', expect.any(Array));
      expect(result.orders).toHaveLength(0);
      expect(result).toHaveProperty('pagination', expect.any(Object));
    });

    it('should throw a error if the page is out of range', async () => {
      await createdOrder();

      await expect(
        ordersService.getMany(createdUser, {
          take: 5,
          page: 5,
        }),
      ).rejects.toThrow(new BadRequestException('Page is out of range'));
    });

    it("should throw a error if user doesn't exist", async () => {
      const user = { uuid: datatype.uuid(), role: createdUser.role } as User;
      await expect(
        ordersService.getMany(user, {
          take: 5,
          page: 1,
        }),
      ).rejects.toThrow(new BadRequestException('User not found'));
    });
  });

  describe('create', () => {
    it("should create a order successfully and user's cart should be empty and total price equals to 0", async () => {
      eventEmitter2.emit.mockResolvedValue(true);

      await cartItemFactory.makeMany(
        categoryLength * productsLength,
        {
          cart: {
            connect: {
              id: createdCart.id,
            },
          },
          product: null,
          quantity: stock,
          unitPrice: price,
          totalPrice: stock * price,
        },
        idproducts,
      );

      const cartTotalPrice = categoryLength * productsLength * stock * price;

      await prisma.cart.update({
        where: {
          id: createdCart.id,
        },
        data: {
          totalPrice: cartTotalPrice,
        },
      });

      const result = await ordersService.create(createdUser.uuid);

      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('totalPrice');
      expect(result).toHaveProperty('uuid');
    });

    it("should return a error if user doesn't exist", async () => {
      await expect(ordersService.create(datatype.uuid())).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it("should return a error it user's cart don't have items", async () => {
      await expect(ordersService.create(createdUser.uuid)).rejects.toThrow(
        new BadRequestException('Cart is empty'),
      );
    });

    it('should return a error if some products or one of them have a quantity out of stock range', async () => {
      await cartItemFactory.makeMany(
        categoryLength * productsLength,
        {
          cart: {
            connect: {
              id: createdCart.id,
            },
          },
          product: null,
          quantity: 6,
          unitPrice: price,
          totalPrice: stock * price,
        },
        idproducts,
      );

      await expect(ordersService.create(createdUser.uuid)).rejects.toThrow(
        new BadRequestException('Quantity of some product is out of range'),
      );
    });
  });
});
