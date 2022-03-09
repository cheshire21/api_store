import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PrismaErrorEnum } from '../utils/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/request/create-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { ResponseProductDto } from './dto/response/product.dto';

@Injectable()
export class ProductsService {
  private select = {
    uuid: true,
    name: true,
    description: true,
    price: true,
    stock: true,
    category: {
      select: {
        uuid: true,
        name: true,
      },
    },
    status: true,
    deletedAt: true,
    updatedAt: true,
    createdAt: true,
  };

  constructor(private prisma: PrismaService) {}

  async getOne(uuid: string): Promise<ResponseProductDto> {
    try {
      const product = await this.prisma.product.findUnique({
        where: {
          uuid,
        },
        select: this.select,
        rejectOnNotFound: false,
      });

      if (!product)
        throw new HttpException("Product doesn't exist", HttpStatus.NOT_FOUND);

      return plainToInstance(ResponseProductDto, product);
    } catch (e) {
      throw e;
    }
  }
  async create(
    createProductDto: CreateProductDto,
  ): Promise<ResponseProductDto> {
    try {
      const { categoryId, ...input } = createProductDto;

      const product = await this.prisma.product.create({
        data: {
          ...input,
          category: {
            connect: {
              uuid: categoryId,
            },
          },
        },
        select: this.select,
      });

      return plainToInstance(ResponseProductDto, product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
      }

      throw error;
    }
  }
  async update(
    uuid: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ResponseProductDto> {
    try {
      const { categoryId, ...input } = updateProductDto;

      const product = await this.prisma.product.update({
        where: {
          uuid,
        },
        data: {
          ...input,
          category: {
            connect: {
              uuid: categoryId,
            },
          },
        },
        select: this.select,
      });

      return plainToInstance(ResponseProductDto, product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new HttpException(
              'Category or product not found',
              HttpStatus.NOT_FOUND,
            );
        }
      }

      throw error;
    }
  }

  async changeStatus(
    uuid: string,
    status: boolean,
  ): Promise<ResponseProductDto> {
    try {
      let deletedAt = status ? null : new Date();

      const product = await this.prisma.product.update({
        where: {
          uuid,
        },
        data: {
          status,
          deletedAt,
        },
        select: this.select,
      });

      return plainToInstance(ResponseProductDto, product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }
      }
      throw error;
    }
  }
}
