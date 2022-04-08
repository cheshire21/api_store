import { Like, Prisma } from '@prisma/client';
import { datatype } from 'faker';
import { PrismaService } from '../../prisma/prisma.service';
import { Abstractfactory } from '../../common/factories/abstract.factory';

type LikeInput = Prisma.LikeCreateInput;

export class LikeFactory extends Abstractfactory<Like> {
  constructor(protected prisma: PrismaService) {
    super();
  }

  async make(data: LikeInput): Promise<Like> {
    const like = await this.prisma.like.create({
      data: {
        like: data.like ?? datatype.boolean(),
        user: data.user,
        product: data.product,
      },
    });
    return like;
  }

  makeMany(quanty: number, data: LikeInput): Promise<Like[]> {
    return Promise.all([...Array(quanty)].map(() => this.make(data)));
  }
}
