import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { name, internet, address, datatype } from 'faker';
import { hashSync } from 'bcryptjs';
import { Role } from '../utils/enums';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/request/signup.dto';
import { User } from '@prisma/client';

const MockUserService = () => ({
  create: jest.fn(),
  findOneByEmail: jest.fn(),
});

describe('AuthService', () => {
  let mockUser;

  let authService: AuthService;
  let prisma: PrismaService;
  // let jwtService: JwtService;
  let userService;
  console.log(process.env.DATABASE_URL);
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
          provide: UserService,
          useFactory: MockUserService,
        },
      ],
    }).compile();

    authService = await module.get<AuthService>(AuthService);
    userService = await module.get<UserService>(UserService);
    prisma = await module.get<PrismaService>(PrismaService);

    mockUser = plainToInstance(SignUpDto, {
      firstName: name.firstName(),
      lastName: name.lastName(),
      userName: internet.userName(),
      address: address.direction(),
      email: internet.email(),
      password: '12345678',
      passwordConfirmation: '12345678',
      role: Role.user,
    });
  });

  describe('signup', () => {
    it('should throw error if email already exist', async () => {
      userService.findOneByEmail.mockResolvedValue(true);

      await expect(authService.signup(mockUser)).rejects.toThrow(
        new HttpException('Email already exists', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw error if password and confirmation are diferent', async () => {
      userService.findOneByEmail.mockResolvedValue(null);

      await expect(
        authService.signup({
          ...mockUser,
          passwordConfirmation: internet.password(),
        }),
      ).rejects.toThrow(
        new HttpException(
          "Password and Pasword Confirmation don't match",
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should create a account successfully', async () => {
      userService.findOneByEmail.mockResolvedValue(false);
      userService.create.mockResolvedValue(true);
      expect(await authService.signup(mockUser)).toBeUndefined();
    });
  });

  describe('login', () => {
    let createdUser: User;

    beforeAll(async () => {
      const { passwordConfirmation, password, ...input } = mockUser;
      createdUser = await prisma.user.create({
        data: {
          ...input,
          password: hashSync(password, 10),
        },
      });
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
      const { passwordConfirmation, password, ...input } = mockUser;
      createdUser = await prisma.user.create({
        data: {
          ...input,
          password: hashSync(password, 10),
        },
      });
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
});
