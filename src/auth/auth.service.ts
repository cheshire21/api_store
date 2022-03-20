import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/request/login.dto';
import { SignUpDto } from './dto/request/sign-up.dto';
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
    private userService: UsersService,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<void> {
    const { password, email } = signUpDto;

    if (await this.userService.findOneByEmail(email))
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);

    await this.userService.create(signUpDto);
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
        }
      }

      throw e;
    }
  }
  async logout(token: string): Promise<void> {
    try {
      const { sub } = this.jwtService.verify(token);

      await this.prisma.token.delete({
        where: {
          jti: sub,
        },
      });
    } catch (e) {
      throw new HttpException('Token is invalid', HttpStatus.BAD_REQUEST);
    }
  }
}
