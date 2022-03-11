import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { name, internet, address, datatype } from 'faker';
import { Role } from '../utils/enums';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/request/signup.dto';
import { User } from '@prisma/client';
import { UserFactory } from '../utils/factories/user.factory';

const MockUsersService = () => ({
  create: jest.fn(),
  findOneByEmail: jest.fn(),
});

describe('AuthService', () => {
  let mockUser;

  let authService: AuthService;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let userService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET_KEY,
          signOptions: {
            expiresIn: parseInt(process.env.JWT_EXPIRE_TIME, 10),
          },
        }),
      ],
      providers: [
        AuthService,
        PrismaService,
        {
          provide: UsersService,
          useFactory: MockUsersService,
        },
      ],
    }).compile();

    authService = await module.get<AuthService>(AuthService);
    userService = await module.get<UsersService>(UsersService);
    prisma = await module.get<PrismaService>(PrismaService);

    userFactory = new UserFactory(prisma);

    mockUser = plainToInstance(SignUpDto, {
      firstName: name.firstName(),
      lastName: name.lastName(),
      userName: internet.userName(),
      address: address.direction(),
      email: internet.email(),
      password: '12345678',
      role: Role.client,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('signup', () => {
    it('should throw error if email already exist', async () => {
      userService.findOneByEmail.mockResolvedValue(true);
      await expect(authService.signup(mockUser)).rejects.toThrow(
        new HttpException('Email already exists', HttpStatus.BAD_REQUEST),
      );
      expect(userService.findOneByEmail).toHaveBeenCalled();
    });

    it('should create a account successfully', async () => {
      userService.findOneByEmail.mockResolvedValue(false);
      userService.create.mockResolvedValue(true);

      expect(await authService.signup(mockUser)).toBeUndefined();
      expect(userService.findOneByEmail).toHaveBeenCalled();
      expect(userService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    let createdUser: User;

    beforeAll(async () => {
      createdUser = await userFactory.make(mockUser);
    });

    it("should throw error if sent email doesn't exist", async () => {
      userService.findOneByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: internet.email(),
          password: internet.password(),
        }),
      ).rejects.toThrow(
        new HttpException("Email doesn't exist ", HttpStatus.UNAUTHORIZED),
      );
      expect(userService.findOneByEmail).toHaveBeenCalled();
    });

    it('should throw error if password is incorrect', async () => {
      userService.findOneByEmail.mockResolvedValue(createdUser);

      const { email } = createdUser;

      await expect(
        authService.login({ email, password: internet.password() }),
      ).rejects.toThrow(
        new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should return a token if user login sucessfully', async () => {
      userService.findOneByEmail.mockResolvedValue(createdUser);

      const { email, password } = mockUser;
      const result = await authService.login({ email, password });

      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('createToken', () => {
    let createdUser: User;

    beforeAll(async () => {
      createdUser = await userFactory.make(mockUser);
    });

    it('should return a token record successfully', async () => {
      const result = await authService.createToken(createdUser.id);

      expect(result).toHaveProperty('jti');
    });

    it("should throw error if user doesn't exist", async () => {
      await expect(authService.createToken(datatype.number())).rejects.toThrow(
        new HttpException('User no found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('generateToken', () => {
    it('should return a token successfully', async () => {
      const result = await authService.generateToken(datatype.uuid());

      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      let createdUser = await userFactory.make();
      let token = await authService.createToken(createdUser.id);
      let value = authService.generateToken(token.jti);

      expect(await authService.logout(value.accessToken)).toBeUndefined();
    });

    it('should return a error if token is invalid', async () => {
      await expect(authService.logout(datatype.uuid())).rejects.toThrow(
        new HttpException('Token is invalid', HttpStatus.UNAUTHORIZED),
      );
    });
  });
});
