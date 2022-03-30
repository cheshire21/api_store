import { Image, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Abstractfactory } from '../../common/factories/abstract.factory';
import { ImageType } from '../../common/enums';

type ImageInput = Partial<Prisma.ImageCreateInput>;

export class ImageFactory extends Abstractfactory<Image> {
  constructor(protected prisma: PrismaService) {
    super();
  }

  async make(data: ImageInput): Promise<Image> {
    const image = await this.prisma.image.create({
      data: {
        product: data.product,
        type: ImageType.jpg,
      },
    });

    return image;
  }

  async makeMany(quanty: number, data: ImageInput = {}): Promise<Image[]> {
    return Promise.all([...Array(quanty)].map(() => this.make(data)));
  }
}
