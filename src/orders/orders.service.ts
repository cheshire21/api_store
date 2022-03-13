import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PaginationOptionsDto } from '../dto/request/pagination-option.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaErrorEnum, Role } from '../utils/enums';
import { ListOrdersDto } from './dto/response/list-orders.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  itemsData = {
    quantity: true,
    unitPrice: true,
    totalPrice: true,
  };

  async getMany(user: User, paginationOptionsDto: PaginationOptionsDto) {
    try {
      const { take, page } = paginationOptionsDto;

      const foundUser = await this.prisma.user.findUnique({
        where: {
          uuid: user.uuid,
        },
        select: {
          id: true,
        },
        rejectOnNotFound: false,
      });

      if (!foundUser)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      let where = {};
      let orderselect = {};

      if (user.role == Role.client) {
        where = {
          user: {
            id: foundUser.id,
          },
        };

        orderselect = {
          user: {
            select: {
              uuid: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        };
      }

      const count = await this.prisma.order.count({ where });

      const totalPages = Math.ceil(count / take);

      if (!totalPages) {
        return plainToInstance(ListOrdersDto, {
          orders: [],
          pagination: {
            totalPages,
            itemsPerPage: take,
            totalItems: count,
            currentPage: 1,
            nextPage: null,
            previousPage: null,
          },
        });
      }

      if (page > totalPages) {
        throw new HttpException('Page is out of range', HttpStatus.BAD_REQUEST);
      }

      const orders = await this.prisma.order.findMany({
        skip: take * (page - 1),
        take: take,
        where,
        select: {
          uuid: true,
          totalPrice: true,
          createdAt: true,
          ...orderselect,
          OrderItem: {
            select: {
              product: {
                select: {
                  uuid: true,
                  name: true,
                },
              },
              ...this.itemsData,
            },
          },
        },
      });

      const nextPage = page === totalPages ? null : page + 1;
      const previousPage = page === 1 ? null : page - 1;

      return plainToInstance(ListOrdersDto, {
        orders,
        pagination: {
          totalPages,
          itemsPerPage: take,
          totalItems: count,
          currentPage: page,
          nextPage,
          previousPage,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async create(userId: string) {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: {
          user: {
            uuid: userId,
          },
        },
        select: {
          id: true,
          userId: true,
          totalPrice: true,
          CartItem: {
            select: {
              product: {
                select: {
                  id: true,
                  stock: true,
                },
              },
              ...this.itemsData,
            },
          },
        },
        rejectOnNotFound: false,
      });

      if (!cart) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (!cart.CartItem || !cart.CartItem.length) {
        throw new HttpException('Cart is empty', HttpStatus.BAD_REQUEST);
      }

      let cartItemLength = cart.CartItem.length;

      for (let i = 0; i < cartItemLength; i++) {
        if (cart.CartItem[i].quantity > cart.CartItem[i].product.stock) {
          throw new HttpException(
            'Quantity of some product is out of range',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const records: Prisma.OrderItemCreateManyOrderInputEnvelope = {
        data: await Promise.all(
          cart.CartItem.map(async (item) => {
            await this.prisma.product.update({
              where: { id: item.product.id },
              data: { stock: item.product.stock - item.quantity },
            });
            return {
              productId: item.product.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            };
          }),
        ),
        skipDuplicates: true,
      };

      await this.prisma.$transaction([
        this.prisma.order.create({
          data: {
            userId: cart.userId,
            totalPrice: cart.totalPrice,
            OrderItem: {
              createMany: records,
            },
          },
        }),

        this.prisma.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            totalPrice: 0,
          },
        }),

        this.prisma.cartItem.deleteMany({
          where: {
            cartId: cart.id,
          },
        }),
      ]);
    } catch (error) {
      throw error;
    }
  }
}
