import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { PrismaErrorEnum } from 'src/common/enums';
import { SendgridService } from 'src/send-emails/send-emails.service';
import { SignUpDto } from '../auth/dto/request/sign-up.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private sendgridService: SendgridService,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      rejectOnNotFound: false,
    });

    return user;
  }

  async findOne(uuid: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        uuid,
      },
      rejectOnNotFound: false,
    });

    return user;
  }

  async updatePassword(uuid: string, password: string) {
    try {
      await this.prisma.user.update({
        data: {
          password: hashSync(password, 10),
        },
        where: {
          uuid,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new HttpException('User no found', HttpStatus.NOT_FOUND);
        }
      }
    }
  }

  async create({ password, ...input }: SignUpDto): Promise<User> {
    return await this.prisma.user.create({
      data: {
        ...input,
        password: hashSync(password, 10),
        cart: {
          create: {
            totalPrice: 0,
          },
        },
      },
    });
  }
}
