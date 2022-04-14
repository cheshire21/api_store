import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilesService } from '../common/services/file.service';
import { LikesService } from '../likes/services/likes.service';
import { ImagesResolver } from './resolvers/image.resolver';
import { ProductsController } from './products.controller';
import { ProductsResolver } from './resolvers/products.resolver';
import { ProductsService } from './services/products.service';
import { UploadImagesResolver } from './resolvers/upload-image.resolver';

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
    UploadImagesResolver,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
