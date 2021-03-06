import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/request/login.dto';
import { SignUpDto } from '../dto/request/sign-up.dto';
import { TokenDto } from '../dto/response/token.dto';
import { compareSync } from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaErrorEnum } from '../../common/enums';
import { Prisma, Token } from '@prisma/client';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { SendgridService } from '../../common/services/send-emails.service';
import { ForgotPasswordDto } from '../dto/request/forgot-password.dto';
import { ChangePasswordDto } from '../dto/request/change-password.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UsersService,
    private sendgridService: SendgridService,
    private configService: ConfigService,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<TokenDto> {
    const { email } = signUpDto;

    if (await this.userService.findOneByEmail(email))
      throw new BadRequestException('Email already exists');

    const user = await this.userService.create(signUpDto);

    const token = await this.createToken(user.id);

    return await this.generateToken(token.jti);
  }

  async login(loginDto: LoginDto): Promise<TokenDto> {
    const { email, password } = loginDto;
    const user = await this.userService.findOneByEmail(email);

    if (!user) throw new UnauthorizedException("Email doesn't exist ");

    const isValid = compareSync(password, user.password);

    if (!isValid) throw new UnauthorizedException('Password is incorrect');

    const token = await this.createToken(user.id);

    return this.generateToken(token.jti);
  }

  generateToken(sub: string, options: JwtSignOptions = null): TokenDto {
    let accessToken;

    if (options) {
      accessToken = this.jwtService.sign(
        {
          sub,
        },
        options,
      );
    } else {
      accessToken = this.jwtService.sign({
        sub,
      });
    }

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
            throw new NotFoundException('User no found');
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
      throw new BadRequestException('Token is invalid');
    }
  }

  async sendEmailChangePassword({ email }: ForgotPasswordDto) {
    try {
      const user = await this.userService.findOneByEmail(email);

      if (!user) {
        throw new NotFoundException('User no found');
      }

      const { accessToken } = this.generateToken(user.uuid, {
        expiresIn: parseInt(
          this.configService.get('JWT_EXPIRE_TIME_RESET_PASSWORD'),
          10,
        ),
      });

      const mail = {
        to: email,
        subject: 'Change your password',
        text: 'This email was sent to change your password',
        html: `<strong>${accessToken}</strong>`,
      };

      await this.sendgridService.send(mail);
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(changePasswordDto: ChangePasswordDto) {
    const { token, password } = changePasswordDto;
    let data;
    try {
      data = this.jwtService.verify(token, { ignoreExpiration: false });
    } catch (error) {
      throw new UnprocessableEntityException('Invalid token');
    }

    await this.userService.updatePassword(data.sub, password);
  }
}
