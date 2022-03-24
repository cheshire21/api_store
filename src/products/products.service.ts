import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PrismaErrorEnum } from '../common/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/request/create-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { ResponseProductDto } from './dto/response/product.dto';
import { PaginationOptionsProduct } from './dto/request/pag-product.dto';
import { ListProductsDto } from './dto/response/list-products.dto';
import { FilesService } from '../files/file.service';
import { ResponseProductImgDto } from './dto/response/product-img.dto';
import { ImageDto } from './dto/request/image.dto';
import { ResponseImageUrlDto } from './dto/response/image-url.dto';

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
          id: true,
          ...this.select,
          image: true,
        },
        rejectOnNotFound: false,
      });

      if (!product)
        throw new HttpException("Product doesn't exist", HttpStatus.NOT_FOUND);

      let urls = [];

      if (product.image?.length) {
        urls = await Promise.all(
          product.image.map(async (img) => {
            return {
              uuid: img.uuid,
              url: await this.fileService.generatePresignedUrl(
                `${img.uuid}.${img.type}`,
              ),
            };
          }),
        );
      }
      const likes = await this.prisma.like.count({
        where: {
          productId: product.id,
          like: true,
        },
      });

      const dislikes = await this.prisma.like.count({
        where: {
          productId: product.id,
          like: true,
        },
      });
      return plainToInstance(ResponseProductImgDto, {
        ...product,
        likes,
        dislikes,
        images: urls,
      });
    } catch (e) {
      throw e;
    }
  }

  async getMany(pagination: PaginationOptionsProduct) {
    const { page, take, category } = pagination;

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
  ): Promise<ResponseProductImgDto> {
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

      return plainToInstance(ResponseProductImgDto, {
        ...product,
        likes: 0,
        dislikes: 0,
        images: [],
      });
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
  ): Promise<ResponseProductImgDto> {
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
        select: {
          ...this.select,
          id: true,
          image: true,
        },
      });

      let urls = [];

      if (product.image?.length) {
        urls = await Promise.all(
          product.image.map(async (img) => {
            return {
              uuid: img.uuid,
              url: await this.fileService.generatePresignedUrl(
                `${img.uuid}.${img.type}`,
              ),
            };
          }),
        );
      }

      const likes = await this.prisma.like.count({
        where: {
          productId: product.id,
          like: true,
        },
      });

      const dislikes = await this.prisma.like.count({
        where: {
          productId: product.id,
          like: true,
        },
      });

      return plainToInstance(ResponseProductImgDto, {
        ...product,
        likes,
        dislikes,
        images: urls,
      });
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
  ): Promise<ResponseProductImgDto> {
    try {
      const deletedAt = status ? null : new Date();

      const product = await this.prisma.product.update({
        where: {
          uuid,
        },
        data: {
          status,
          deletedAt,
        },
        select: {
          ...this.select,
          id: true,
          image: true,
        },
      });

      let urls = [];

      if (product.image?.length) {
        urls = await Promise.all(
          product.image.map(async (img) => {
            return {
              uuid: img.uuid,
              url: await this.fileService.generatePresignedUrl(
                `${img.uuid}.${img.type}`,
              ),
            };
          }),
        );
      }

      const likes = await this.prisma.like.count({
        where: {
          productId: product.id,
          like: true,
        },
      });

      const dislikes = await this.prisma.like.count({
        where: {
          productId: product.id,
          like: true,
        },
      });

      return plainToInstance(ResponseProductImgDto, {
        ...product,
        likes,
        dislikes,
        images: urls,
      });
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

  async uploadImage(productId: string, imageDto: ImageDto) {
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

      const createdImage = await this.prisma.image.create({
        data: {
          productId: product.id,
          ...imageDto,
        },
      });

      const image = await this.fileService.uploadFile(
        createdImage.uuid,
        imageDto.type,
      );

      return plainToInstance(ResponseImageUrlDto, {
        productId: productId,
        type: createdImage.type,
        url: image,
        uuid: createdImage.uuid,
      });
    } catch (error) {
      throw error;
    }
  }
}
