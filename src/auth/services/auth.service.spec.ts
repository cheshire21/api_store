import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { name, internet, address, datatype } from 'faker';
import { Role } from '../../common/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from './auth.service';
import { SignUpDto } from '../dto/request/sign-up.dto';
import { User } from '@prisma/client';
import { UserFactory } from '../../users/factories/user.factory';
import { SendgridService } from '../../common/services/send-emails.service';
import { ConfigModule } from '@nestjs/config';

const MockUsersService = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findOneByEmail: jest.fn(),
  updatePassword: jest.fn(),
});

const MockSendgridService = () => ({
  send: jest.fn(),
});

describe('AuthService', () => {
  let mockUser;

  let authService: AuthService;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let userService;
  let sendgridService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET_KEY,
          signOptions: {
            expiresIn: parseInt(process.env.JWT_EXPIRE_TIME, 10),
          },
        }),
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        AuthService,
        PrismaService,
        {
          provide: UsersService,
          useFactory: MockUsersService,
        },
        {
          provide: SendgridService,
          useFactory: MockSendgridService,
        },
      ],
    }).compile();

    authService = await module.get<AuthService>(AuthService);
    prisma = await module.get<PrismaService>(PrismaService);
    userService = await module.get<UsersService>(UsersService);
    sendgridService = await module.get<SendgridService>(SendgridService);

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
    await prisma.clearDB();
    await prisma.$disconnect();
  });

  describe('signup', () => {
    it('should throw error if email already exist', async () => {
      userService.findOneByEmail.mockResolvedValue(true);
      await expect(authService.signup(mockUser)).rejects.toThrow(
        new BadRequestException('Email already exists'),
      );
      expect(userService.findOneByEmail).toHaveBeenCalled();
    });

    it('should create a account successfully', async () => {
      const email = internet.email();
      const createdUser = await userFactory.make({ ...mockUser, email });
      userService.findOneByEmail.mockResolvedValue(false);
      userService.create.mockResolvedValue(createdUser);

      const result = await authService.signup({ ...mockUser, email });

      expect(result).toHaveProperty('accessToken', expect.any(String));
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
      ).rejects.toThrow(new UnauthorizedException("Email doesn't exist "));
      expect(userService.findOneByEmail).toHaveBeenCalled();
    });

    it('should throw error if password is incorrect', async () => {
      userService.findOneByEmail.mockResolvedValue(createdUser);

      const { email } = createdUser;

      await expect(
        authService.login({ email, password: internet.password() }),
      ).rejects.toThrow(new UnauthorizedException('Password is incorrect'));
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
      createdUser = await userFactory.make({
        ...mockUser,
        email: internet.email(),
      });
    });

    it('should return a token record successfully', async () => {
      const result = await authService.createToken(createdUser.id);

      expect(result).toHaveProperty('jti');
    });

    it("should throw error if user doesn't exist", async () => {
      await expect(authService.createToken(datatype.number())).rejects.toThrow(
        new NotFoundException('User no found'),
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
      const createdUser = await userFactory.make();
      const token = await authService.createToken(createdUser.id);
      const value = authService.generateToken(token.jti);

      expect(await authService.logout(value.accessToken)).toBeUndefined();
    });

    it('should return a error if token is invalid', async () => {
      await expect(authService.logout(datatype.uuid())).rejects.toThrow(
        new UnauthorizedException('Token is invalid'),
      );
    });
  });
  /////////////////////////////////////
  describe('sendEmailChangePassword', () => {
    it('should sen email to change password successfully', async () => {
      const createdUser = await userFactory.make();
      userService.findOneByEmail.mockResolvedValue(createdUser);
      sendgridService.send.mockResolvedValue(true);

      expect(
        await authService.sendEmailChangePassword({ email: createdUser.email }),
      ).toBeUndefined();
    });

    it("should return a error if user doesn't exist", async () => {
      userService.findOneByEmail.mockResolvedValue(null);

      await expect(
        authService.sendEmailChangePassword({ email: internet.email() }),
      ).rejects.toThrow(new NotFoundException('User no found'));
    });
  });

  describe('resetPassword', () => {
    it('should logout successfully', async () => {
      const createdUser = await userFactory.make();
      const { accessToken } = authService.generateToken(createdUser.uuid);
      userService.updatePassword.mockResolvedValue(true);

      expect(
        await authService.resetPassword({
          token: accessToken,
          password: internet.password(),
        }),
      ).toBeUndefined();
    });

    it('should return a error if token is invalid', async () => {
      await expect(
        authService.resetPassword({
          token: '123.132.312',
          password: internet.password(),
        }),
      ).rejects.toThrow(new UnprocessableEntityException('Invalid token'));
    });
  });
});
