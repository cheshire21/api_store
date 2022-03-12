import { CartItem, Prisma } from '@prisma/client';
import { datatype } from 'faker';
import { PrismaService } from 'src/prisma/prisma.service';
import { Abstractfactory } from './abstract.factory';

type CartItemInput = Prisma.CartItemCreateInput;

export class CartItemFactory extends Abstractfactory<CartItem> {
  constructor(protected prisma: PrismaService) {
    super();
  }
  async make(data: CartItemInput, product?: any): Promise<CartItem> {
    const cartItem = await this.prisma.cartItem.create({
      data: {
        cart: data.cart,
        product: product ?? data.product,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice: data.totalPrice,
      },
    });
    return cartItem;
  }

  async makeMany(
    quanty: number,
    data: CartItemInput,
    product?: any,
  ): Promise<CartItem[]> {
    return Promise.all([...product].map((prod) => this.make(data, prod)));
  }
}
