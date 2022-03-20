import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
import { plainToInstance } from 'class-transformer';
import { name, internet, address } from 'faker';
import { Role } from '../utils/enums';
import { SignUpDto } from '../auth/dto/request/sign-up.dto';
import { hashSync } from 'bcryptjs';

describe('UsersService', () => {
  let mockUser;

  let userService: UsersService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    userService = await module.get<UsersService>(UsersService);
    prisma = await module.get<PrismaService>(PrismaService);

    mockUser = plainToInstance(SignUpDto, {
      firstName: name.firstName(),
      lastName: name.lastName(),
      userName: internet.userName(),
      address: address.direction(),
      email: internet.email(),
      password: hashSync(internet.password(), 10),
      role: Role.client,
    });
  });

  afterAll(async () => {
    await prisma.clearDB();
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const result = await userService.create(mockUser);

      expect(result).toHaveProperty('firstName', mockUser.firstName);
      expect(result).toHaveProperty('lastName', mockUser.lastName);
      expect(result).toHaveProperty('email', mockUser.email);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a existent user ', async () => {
      const createdUser = await prisma.user.create({
        data: {
          ...mockUser,
          email: internet.email(),
        },
      });

      const result = await userService.findOneByEmail(createdUser.email);

      expect(result).toHaveProperty('id', createdUser.id);
      expect(result).toHaveProperty('uuid', createdUser.uuid);
      expect(result).toHaveProperty('firstName', createdUser.firstName);
      expect(result).toHaveProperty('lastName', createdUser.lastName);
      expect(result).toHaveProperty('email', createdUser.email);
    });

    it("should return null if user doesn't exist", async () => {
      expect(await userService.findOneByEmail(internet.email())).toBeNull();
    });
  });
});
