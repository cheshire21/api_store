import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PrismaErrorEnum } from '../../common/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from '../dto/request/create-product.dto';
import { UpdateProductDto } from '../dto/request/update-product.dto';
import { ResponseProductDto } from '../dto/response/product.dto';
import { ListProductsDto } from '../dto/response/list-products.dto';
import { PaginationOptionsProduct } from '../dto/request/pag-product.dto';
import { FilesService } from '../../common/services/file.service';
import { ImageDto } from '../dto/request/image.dto';
import { ResponseImageUrlDto } from '../dto/response/image-url.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private fileService: FilesService,
  ) {}

  private select = {
    id: true,
    image: true,
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

      if (!product) throw new NotFoundException("Product doesn't exist");

      let urls = [];

      if (product.image?.length) {
        urls = await Promise.all(
          product.image.map(async (img) => {
            return {
              uuid: img.uuid,
              url: await this.fileService.generatePresignedUrl(
                `${img.uuid}.${img.type}`,
              ),
              type: img.type,
              productId: product.uuid,
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
          like: false,
        },
      });
      return plainToInstance(ResponseProductDto, {
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

    if (!totalPages) {
      return plainToInstance(ListProductsDto, {
        products: [],
        pagination: {
          totalPages,
          itemsPerPage: take,
          totalItems: count,
          currentPage: 1,
          nextPage: null,
          previousPage: null,
        },
      });
    }

    if (page > totalPages) {
      throw new BadRequestException('page is out of range');
    }

    const products = await this.prisma.product.findMany({
      skip: take * (page - 1),
      take: take,
      where,
      select: this.select,
    });

    const data = await Promise.all(
      products.map(async (product) => {
        let urls = [];

        if (product.image?.length) {
          urls = await Promise.all(
            product.image.map(async (img) => {
              return {
                uuid: img.uuid,
                url: await this.fileService.generatePresignedUrl(
                  `${img.uuid}.${img.type}`,
                ),
                type: img.type,
                productId: product.uuid,
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
            like: false,
          },
        });

        return {
          ...product,
          likes,
          dislikes,
          images: urls,
        };
      }),
    );

    const nextPage = page === totalPages ? null : page + 1;
    const previousPage = page === 1 ? null : page - 1;

    return plainToInstance(ListProductsDto, {
      products: plainToInstance(ResponseProductDto, data),
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

      return plainToInstance(ResponseProductDto, {
        ...product,
        likes: 0,
        dislikes: 0,
        images: [],
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new NotFoundException('Category not found');
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
        throw new NotFoundException('Product not found');
      }

      if (oldpProduct.deletedAt) {
        throw new UnauthorizedException('Product is disable ');
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

      let urls = [];

      if (product.image?.length) {
        urls = await Promise.all(
          product.image.map(async (img) => {
            return {
              uuid: img.uuid,
              url: await this.fileService.generatePresignedUrl(
                `${img.uuid}.${img.type}`,
              ),
              type: img.type,
              productId: product.uuid,
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
          like: false,
        },
      });

      return plainToInstance(ResponseProductDto, {
        ...product,
        likes,
        dislikes,
        images: urls,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new NotFoundException('Category not found');
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
      const deletedAt = status ? null : new Date();

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

      let urls = [];

      if (product.image?.length) {
        urls = await Promise.all(
          product.image.map(async (img) => {
            return {
              uuid: img.uuid,
              url: await this.fileService.generatePresignedUrl(
                `${img.uuid}.${img.type}`,
              ),
              type: img.type,
              productId: product.uuid,
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
          like: false,
        },
      });

      return plainToInstance(ResponseProductDto, {
        ...product,
        likes,
        dislikes,
        images: urls,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new NotFoundException('Product not found');
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
        throw new NotFoundException('Product not found');
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
