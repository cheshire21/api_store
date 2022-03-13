import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaErrorEnum } from '../utils/enums';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

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
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            },
          },
        },
        rejectOnNotFound: false,
      });
      if (!cart) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      console.log(`cart: length ${cart.CartItem.length} \t ${cart.CartItem}`);
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

      const order = await this.prisma.order.create({
        data: {
          userId: cart.userId,
          totalPrice: cart.totalPrice,
          OrderItem: {
            createMany: records,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
