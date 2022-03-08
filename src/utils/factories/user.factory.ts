import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Abstractfactory } from './abstract.factory';
import { name, internet, address } from 'faker';
import { Role } from '../enums';
import { hashSync } from 'bcryptjs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

export class UserFactory extends Abstractfactory<User> {
  constructor(protected prisma: PrismaService) {
    super();
  }

  async make(data: any = {}): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName ?? name.firstName(),
        lastName: data.lastName ?? name.lastName(),
        userName: data.userName ?? internet.userName(),
        address: data.address ?? address.direction(),
        email: data.email ?? internet.email(),
        password: hashSync(data.password ?? internet.password(), 10),
        role: data.role ?? Role.user,
      },
    });

    return user;
  }

  makeMany(quanty: number, data: unknown = {}): Promise<User[]> {
    return Promise.all([...Array(quanty)].map(() => this.make(data)));
  }
}