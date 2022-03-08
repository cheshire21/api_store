import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
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

  async create({ password, ...input }: CreateUserDto): Promise<void> {
    await this.prisma.user.create({
      data: {
        ...input,
        password: hashSync(password, 10),
      },
    });
  }
}
