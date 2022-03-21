import { OrderItem, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Abstractfactory } from '../../common/factories/abstract.factory';

type OrderItemInput = Prisma.OrderItemCreateInput;

export class OrderItemFactory extends Abstractfactory<OrderItem> {
  constructor(protected prisma: PrismaService) {
    super();
  }
  async make(data: OrderItemInput, product?: any): Promise<OrderItem> {
    const cartItem = await this.prisma.orderItem.create({
      data: {
        order: data.order,
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
    data: OrderItemInput,
    product?: any,
  ): Promise<OrderItem[]> {
    return Promise.all([...product].map((prod) => this.make(data, prod)));
  }
}
