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
import { FilesService } from './file.service';
import { ResponseProductImgDto } from './dto/response/product-img.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private fileService: FilesService,
  ) {}

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

  async getOne(uuid: string): Promise<ResponseProductImgDto> {
    try {
      const product = await this.prisma.product.findUnique({
        where: {
          uuid,
        },
        select: {
          ...this.select,
          image: true,
        },
        rejectOnNotFound: false,
      });

      if (!product)
        throw new HttpException("Product doesn't exist", HttpStatus.NOT_FOUND);

      let url = null;
      if (product.image) {
        url = await this.fileService.generatePresignedUrl(product.image);
      }

      return plainToInstance(ResponseProductImgDto, {
        ...product,
        image: url,
      });
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

      let category = {};
      if (categoryId) {
        category = {
          category: {
            connect: {
              uuid: categoryId,
            },
          },
        };
      }

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
          ...category,
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

  async uploadImage(productId: string, buffer: Buffer, originalname: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: {
          uuid: productId,
        },
        select: {
          id: true,
          name: true,
        },
        rejectOnNotFound: false,
      });

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      const [name, type] = originalname.split('.');

      const nameImage = `${productId}-${product.name}.${type}`;

      const image = await this.fileService.uploadFile(buffer, nameImage);

      await this.prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          image: image.key,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
