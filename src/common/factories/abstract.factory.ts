import { PrismaService } from '../../prisma/prisma.service';

export abstract class Abstractfactory<T> {
  protected prisma: PrismaService;

  abstract make(data?: unknown): Promise<T>;

  abstract makeMany(quanty: number, data: unknown): Promise<T[]>;
}
