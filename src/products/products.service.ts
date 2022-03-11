import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PrismaErrorEnum } from '../utils/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/request/create-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { ResponseProductDto } from './dto/response/product.dto';
import { PaginationOptionsProduct } from './dto/request/pag-product.dto';
import { ListProductsDto } from './dto/response/list-products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

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

  async getMany(pagination: PaginationOptionsProduct) {
    let { page, take, category } = pagination;

    let where = {};
    if (category) {
      where = {
        category: {
          name: {
            contains: category,
          },
        },
      };
    }

    const count = await this.prisma.product.count({ where });

    const totalPages = Math.ceil(count / take);

    if (page > totalPages) {
      throw new HttpException('page is out of range', HttpStatus.BAD_REQUEST);
    }

    const products = await this.prisma.product.findMany({
      skip: take * (page - 1),
      take: take,
      where,
      select: this.select,
    });

    const nextPage = page === totalPages ? null : page + 1;
    const previousPage = page === 1 ? null : page - 1;

    return plainToInstance(ListProductsDto, {
      products,
      pagination: {
        totalPages,
        itemsPerPage: take,
        totalItems: count,
        currentPage: page,
        nextPage,
        previousPage,
      },
    });
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
      const oldpProduct = await this.prisma.product.findUnique({
        where: {
          uuid,
        },
        select: {
          id: true,
          status: true,
          deletedAt: true,
        },
        rejectOnNotFound: false,
      });

      if (!oldpProduct) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      if (oldpProduct.deletedAt) {
        throw new HttpException('Product is disable ', HttpStatus.UNAUTHORIZED);
      }

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
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
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
