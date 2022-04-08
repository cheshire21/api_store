import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SendgridService } from 'src/common/services/send-emails.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [ConfigModule],
  providers: [UsersService, PrismaService, SendgridService],
  exports: [UsersService],
})
export class UsersModule {}
