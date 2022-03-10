import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LikeDto } from './resquest/like.dto';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async upsertLike(
    userId: string,
    productId: string,
    likeDto: LikeDto,
  ): Promise<void> {}

  async deleteLike(userId: string, productId: string): Promise<void> {}
}
