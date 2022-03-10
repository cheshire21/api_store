import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaErrorEnum } from '../utils/enums';
import { LikeDto } from './resquest/like.dto';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async upsertLike(
    userId: string,
    productId: string,
    likeDto: LikeDto,
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { uuid: userId },
        select: { id: true },
        rejectOnNotFound: false,
      });
      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const product = await this.prisma.product.findUnique({
        where: { uuid: productId },
        select: { id: true },
        rejectOnNotFound: false,
      });
      if (!product)
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);

      const like = await this.prisma.like.upsert({
        create: {
          user: {
            connect: {
              uuid: userId,
            },
          },
          product: {
            connect: {
              uuid: productId,
            },
          },
          ...likeDto,
        },
        update: {
          ...likeDto,
        },
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteLike(userId: string, productId: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { uuid: userId },
        select: { id: true },
        rejectOnNotFound: false,
      });
      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const product = await this.prisma.product.findUnique({
        where: { uuid: productId },
        select: { id: true },
        rejectOnNotFound: false,
      });
      if (!product)
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);

      await this.prisma.like.delete({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
