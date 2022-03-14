import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilesService } from './file.service';
import { LikesService } from './likes.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [ProductsController],
  providers: [ProductsService, LikesService, PrismaService, FilesService],
})
export class ProductsModule {}
