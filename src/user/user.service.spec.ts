import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { plainToInstance } from 'class-transformer';
import { name, internet, address } from 'faker';
import { Role } from '../utils/enums';

describe('UserService', () => {
  let mockUser;

  let userService: UserService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    userService = await module.get<UserService>(UserService);
    prisma = await module.get<PrismaService>(PrismaService);

    mockUser = plainToInstance(CreateUserDto, {
      firstName: name.firstName(),
      lastName: name.lastName(),
      userName: internet.userName(),
      address: address.direction(),
      email: internet.email(),
      password: '12345678',
      role: Role.user,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a user', async () => {
      expect(await userService.create(mockUser)).toBeUndefined();
    });
  });

  describe('findOneByEmail', () => {
    it('should return a existent user ', async () => {
      const user = await prisma.user.create({
        data: {
          ...mockUser,
          email: internet.email(),
        },
      });

      const result = await userService.findOneByEmail(mockUser.email);

      expect(result).toBeDefined();
    });

    it("should return null if user doesn't exist", async () => {
      expect(await userService.findOneByEmail(internet.email())).toBeNull();
    });
  });
});
