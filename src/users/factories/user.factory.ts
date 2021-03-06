import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Abstractfactory } from '../../common/factories/abstract.factory';
import { name, internet, address } from 'faker';
import { Role } from '../../common/enums';
import { hashSync } from 'bcryptjs';

type UserInput = Partial<Prisma.UserCreateInput>;

export class UserFactory extends Abstractfactory<User> {
  constructor(protected prisma: PrismaService) {
    super();
  }

  async make(data: UserInput = {}): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName ?? name.firstName(),
        lastName: data.lastName ?? name.lastName(),
        userName: data.userName ?? internet.userName(),
        address: data.address ?? address.direction(),
        email: data.email ?? internet.email(),
        password: hashSync(data.password ?? internet.password(), 10),
        role: data.role ?? Role.client,
        cart: {
          create: {
            totalPrice: 0,
          },
        },
      },
    });

    return user;
  }

  makeMany(quanty: number, data: UserInput = {}): Promise<User[]> {
    return Promise.all([...Array(quanty)].map(() => this.make(data)));
  }
}
