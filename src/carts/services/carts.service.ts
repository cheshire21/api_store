import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCartItemDto } from '../dto/request/create-cart-item.dto';
import { CartItemsDto } from '../dto/response/cart-items.dto';
import { ResponseCartDto } from '../dto/response/response-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async getItems(userId: string) {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: {
          user: {
            uuid: userId,
          },
        },
        select: {
          cartItem: {
            select: {
              product: {
                select: {
                  uuid: true,
                  name: true,
                },
              },
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            },
          },
          totalPrice: true,
          updatedAt: true,
          createdAt: true,
        },
        rejectOnNotFound: true,
      });

      return plainToInstance(CartItemsDto, {
        ...cart,
        items: cart.cartItem,
      });
    } catch (error) {
      throw error;
    }
  }

  async upsertItem(
    userId: string,
    createCartItem: CreateCartItemDto,
  ): Promise<ResponseCartDto> {
    try {
      const { productId, quantity } = createCartItem;

      const product = await this.prisma.product.findUnique({
        where: {
          uuid: productId,
        },
        select: {
          id: true,
          stock: true,
          price: true,
          deletedAt: true,
        },
        rejectOnNotFound: false,
      });

      if (!product)
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);

      if (product.deletedAt)
        throw new HttpException(
          'Product is in disable status',
          HttpStatus.UNAUTHORIZED,
        );

      if (quantity > product.stock) {
        throw new HttpException(
          'Quantity is bigger than stock',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.prisma.user.findUnique({
        where: {
          uuid: userId,
        },
        select: {
          cart: true,
          id: true,
        },
        rejectOnNotFound: false,
      });

      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const cartItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            productId: product.id,
            cartId: user.cart[0].id,
          },
        },
        rejectOnNotFound: false,
      });

      const productTotalPrice = quantity * product.price;

      const previousProductTotalPrice = !cartItem ? 0 : cartItem.totalPrice;

      const totalPrice =
        user.cart[0].totalPrice + productTotalPrice - previousProductTotalPrice;

      const [cart, newCartItem] = await this.prisma.$transaction([
        this.prisma.cart.update({
          where: {
            id: user.cart[0].id,
          },
          data: {
            totalPrice: totalPrice,
          },
        }),

        this.prisma.cartItem.upsert({
          where: {
            cartId_productId: {
              productId: product.id,
              cartId: user.cart[0].id,
            },
          },
          update: {
            unitPrice: product.price,
            quantity,
            totalPrice: productTotalPrice,
          },
          create: {
            product: {
              connect: {
                id: product.id,
              },
            },
            cart: {
              connect: {
                id: user.cart[0].id,
              },
            },
            unitPrice: product.price,
            quantity,
            totalPrice: productTotalPrice,
          },
          select: {
            product: {
              select: {
                uuid: true,
                name: true,
              },
            },
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        }),
      ]);

      return plainToInstance(ResponseCartDto, newCartItem);
    } catch (error) {
      throw error;
    }
  }

  async delete(userId: string, productId: string): Promise<boolean> {
    try {
      const product = await this.prisma.product.findUnique({
        where: {
          uuid: productId,
        },
        select: {
          id: true,
          stock: true,
          price: true,
        },
        rejectOnNotFound: false,
      });

      if (!product)
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);

      const user = await this.prisma.user.findUnique({
        where: {
          uuid: userId,
        },
        select: {
          cart: true,
        },
        rejectOnNotFound: false,
      });

      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const cartItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            productId: product.id,
            cartId: user.cart[0].id,
          },
        },
        select: {
          totalPrice: true,
        },
        rejectOnNotFound: false,
      });

      const totalPrice = user.cart[0].totalPrice - cartItem.totalPrice;

      await this.prisma.$transaction([
        this.prisma.cart.update({
          where: {
            id: user.cart[0].id,
          },
          data: {
            totalPrice: totalPrice,
          },
        }),
        this.prisma.cartItem.delete({
          where: {
            cartId_productId: {
              cartId: user.cart[0].id,
              productId: product.id,
            },
          },
        }),
      ]);

      return true;
    } catch (error) {
      throw error;
    }
  }
}
