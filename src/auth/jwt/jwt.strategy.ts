import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    try {
      const { user } = await this.prisma.token.findUnique({
        where: {
          jti: payload.sub,
        },
        select: {
          user: {
            select: {
              uuid: true,
              role: true,
            },
          },
        },
      });

      return {
        userId: user.uuid,
        role: user.role,
      };
    } catch (error) {
      throw new HttpException('token is invalid', HttpStatus.UNAUTHORIZED);
    }
  }
}
