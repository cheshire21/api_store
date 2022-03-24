import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilesService } from '../files/file.service';
import { LikesService } from '../likes/likes.service';
import { ImagesResolver } from './image.resolver';
import { ProductsController } from './products.controller';
import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    LikesService,
    PrismaService,
    FilesService,
    JwtAuthGuard,
    RolesGuard,
    ProductsResolver,
    ImagesResolver,
  ],
})
export class ProductsModule {}
