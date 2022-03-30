import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { Role } from '../common/enums';
import { PaginationOptionsDto } from '../common/dto/request/pagination-option.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ListOrdersDto } from './dto/response/list-orders.dto';
import { ResponseOrderDto } from './dto/response/order.dto';
import { ClientOrderDto } from './dto/response/client-order.dto';
import { ItemDto } from '../products/dto/response/item.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

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
      let orderselect = {
        user: {
          select: {
            uuid: true,
            firstName: true,
            lastName: true,
            userName: true,
            email: true,
          },
        },
      };

      if (user.role !== Role.manager) {
        where = {
          user: {
            id: foundUser.id,
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
          orderItem: {
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

      const dataOrders = orders.map((order) => {
        const { orderItem, user, ...data } = order;
        return {
          ...data,
          client: user,
          items: plainToInstance(ItemDto, orderItem),
        };
      });

      const nextPage = page === totalPages ? null : page + 1;
      const previousPage = page === 1 ? null : page - 1;

      return plainToInstance(ListOrdersDto, {
        orders:
          user.role === Role.manager
            ? plainToInstance(ClientOrderDto, dataOrders)
            : plainToInstance(ResponseOrderDto, dataOrders),
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

  async create(userId: string): Promise<ResponseOrderDto> {
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
          cartItem: {
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

      if (!cart.cartItem?.length) {
        throw new HttpException('Cart is empty', HttpStatus.BAD_REQUEST);
      }

      const cartItemLength = cart.cartItem.length;

      for (let i = 0; i < cartItemLength; i++) {
        if (cart.cartItem[i].quantity > cart.cartItem[i].product.stock) {
          throw new HttpException(
            'Quantity of some product is out of range',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const records =
        async (): Promise<Prisma.OrderItemCreateManyOrderInputEnvelope> => {
          return {
            data: await Promise.all(
              cart.cartItem.map(async (item) => {
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
        };

      const [order, _, __] = await this.prisma.$transaction([
        this.prisma.order.create({
          data: {
            userId: cart.userId,
            totalPrice: cart.totalPrice,
            orderItem: {
              createMany: await records(),
            },
          },
          select: {
            uuid: true,
            totalPrice: true,
            createdAt: true,
            orderItem: {
              select: {
                quantity: true,
                unitPrice: true,
                totalPrice: true,
                product: {
                  select: {
                    uuid: true,
                    name: true,
                  },
                },
              },
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

      this.eventEmitter.emit('order.created', cart.cartItem);

      const { orderItem, ...input } = order;

      return plainToInstance(ResponseOrderDto, {
        ...input,
        items: orderItem,
      });
    } catch (error) {
      throw error;
    }
  }
}
