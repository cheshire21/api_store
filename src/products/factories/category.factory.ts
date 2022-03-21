import { Category, Prisma } from '@prisma/client';
import { commerce } from 'faker';
import { PrismaService } from '../../prisma/prisma.service';
import { Abstractfactory } from '../../common/factories/abstract.factory';

type CategoryInput = Partial<Prisma.CategoryCreateInput>;

export class CategoryFactory extends Abstractfactory<Category> {
  constructor(protected prisma: PrismaService) {
    super();
  }

  async make(data: CategoryInput = {}): Promise<Category> {
    const category = await this.prisma.category.create({
      data: {
        name: data.name ?? commerce.productMaterial(),
      },
    });

    return category;
  }

  async makeMany(
    quanty: number,
    data: CategoryInput = {},
  ): Promise<Category[]> {
    return Promise.all([...Array(quanty)].map(() => this.make(data)));
  }
}
