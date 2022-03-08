import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/request/login.dto';
import { SignUpDto } from './dto/request/signup.dto';
import { TokenDto } from './dto/response/token.dto';
import { compareSync } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaErrorEnum, Role } from '../utils/enums';
import { Prisma, Token } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<void> {
    const { password, passwordConfirmation, email } = signUpDto;

    if (await this.userService.findOneByEmail(email))
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);

    if (password !== passwordConfirmation)
      throw new HttpException(
        "Password and Pasword Confirmation don't match",
        HttpStatus.BAD_REQUEST,
      );

    const user = plainToInstance(CreateUserDto, signUpDto);

    await this.userService.create(user);
  }

  async login(loginDto: LoginDto): Promise<TokenDto> {
    const { email, password } = loginDto;
    const user = await this.userService.findOneByEmail(email);

    if (!user)
      throw new HttpException("Email doesn't exist ", HttpStatus.UNAUTHORIZED);

    const isValid = compareSync(password, user.password);

    if (!isValid)
      throw new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED);

    const token = await this.createToken(user.id);

    return this.generateToken(token.jti);
  }

  generateToken(sub: string): TokenDto {
    const accessToken = this.jwtService.sign({
      sub,
    });

    return {
      accessToken,
    };
  }

  async createToken(userId: number): Promise<Token> {
    try {
      const token = await this.prisma.token.create({
        data: {
          userId,
        },
      });
      return token;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case PrismaErrorEnum.FOREIGN_KEY_CONSTRAINT:
            throw new HttpException('User no found', HttpStatus.NOT_FOUND);
          default:
            throw e;
        }
      }

      throw e;
    }
  }
  logout() {}
}
