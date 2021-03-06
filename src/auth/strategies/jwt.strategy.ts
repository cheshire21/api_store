import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
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
        uuid: user.uuid,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('token is invalid');
    }
  }
}
