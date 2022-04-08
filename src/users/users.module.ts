import { Module } from '@nestjs/common';
import { SendEmailsModule } from 'src/send-emails/send-emails.module';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [SendEmailsModule],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
