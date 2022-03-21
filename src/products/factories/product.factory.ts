import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Abstractfactory } from '../../common/factories/abstract.factory';
import { datatype, commerce } from 'faker';

type ProductInput = Partial<Prisma.ProductCreateInput>;

export class ProductFactory extends Abstractfactory<Product> {
  constructor(protected prisma: PrismaService) {
    super();
  }

  async make(data: ProductInput = {}): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        name: data.name ?? commerce.productName(),
        description: data.description ?? commerce.productDescription(),
        price: data.price ?? datatype.float(),
        stock: data.stock ?? datatype.number(),
        category: data.category,
      },
    });
    return product;
  }

  makeMany(quanty: number, data: ProductInput): Promise<Product[]> {
    return Promise.all([...Array(quanty)].map(() => this.make(data)));
  }
}
