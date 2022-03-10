import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { SignUpDto } from '../auth/dto/request/signup.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      rejectOnNotFound: false,
    });

    return user;
  }

  async create({ password, ...input }: SignUpDto): Promise<void> {
    await this.prisma.user.create({
      data: {
        ...input,
        password: hashSync(password, 10),
      },
    });
  }
}
