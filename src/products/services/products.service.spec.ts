import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Category, Product } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { commerce, datatype, internet } from 'faker';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryFactory } from '../factories/category.factory';
import { ProductFactory } from '../factories/product.factory';
import { CreateProductDto } from '../dto/request/create-product.dto';
import { PaginationOptionsProduct } from '../dto/request/pag-product.dto';
import { FilesService } from '../../common/services/file.service';
import { ProductsService } from './products.service';
import { ImageType } from '../../common/enums';
import { ImageFactory } from '../factories/image.factory';

const MockFilesService = () => ({
  uploadFile: jest.fn(),
  generatePresignedUrl: jest.fn(),
});

describe('ProductsService', () => {
  let productsService: ProductsService;
  let prisma: PrismaService;
  let filesService;

  let productFactory: ProductFactory;
  let categoryFactory: CategoryFactory;
  let imageFactory: ImageFactory;

  let categories: Category[];
  let product: CreateProductDto;
  const length = 3;

  const random = () => Math.floor(Math.random() * length);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        PrismaService,
        {
          provide: FilesService,
          useFactory: MockFilesService,
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    filesService = module.get<FilesService>(FilesService);
    prisma = module.get<PrismaService>(PrismaService);

    productFactory = new ProductFactory(prisma);
    categoryFactory = new CategoryFactory(prisma);
    imageFactory = new ImageFactory(prisma);

    categories = await categoryFactory.makeMany(length);
  });

  beforeEach(() => {
    product = {
      name: commerce.productName(),
      description: commerce.productDescription(),
      price: datatype.float(),
      stock: datatype.number(),
      categoryId: categories[random()].uuid,
    };
  });

  afterAll(async () => {
    await prisma.clearDB();
    await prisma.$disconnect();
  });

  describe('getOne', () => {
    it('should return a product', async () => {
      const createdProduct = await productFactory.make({
        category: {
          connect: {
            id: categories[random()].id,
          },
        },
      });

      await imageFactory.make({
        product: {
          connect: {
            id: createdProduct.id,
          },
        },
      });

      filesService.generatePresignedUrl.mockResolvedValue(internet.url());

      const result = await productsService.getOne(createdProduct.uuid);

      expect(result).toHaveProperty('name', createdProduct.name);
      expect(result).toHaveProperty('description', createdProduct.description);
      expect(result).toHaveProperty('price', createdProduct.price);
      expect(result).toHaveProperty('stock', createdProduct.stock);
      expect(result).toHaveProperty('images');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('status', createdProduct.status);
      expect(result).toHaveProperty('updatedAt', createdProduct.updatedAt);
      expect(result).toHaveProperty('createdAt', createdProduct.createdAt);
    });

    it("should throw a error if product doesn't exist", async () => {
      await expect(productsService.getOne(datatype.uuid())).rejects.toThrow(
        new NotFoundException("Product doesn't exist"),
      );
    });
  });

  describe('getMany', () => {
    beforeAll(async () => {
      for (let i = 0; i < length; i++) {
        const arr = await productFactory.makeMany(4, {
          category: {
            connect: {
              id: categories[i].id,
            },
          },
        });

        arr.forEach(async (img) => {
          await imageFactory.make({
            product: {
              connect: {
                id: img.id,
              },
            },
          });
        });
      }
    });

    it('should return a page with a specific take and a specific page', async () => {
      filesService.generatePresignedUrl.mockResolvedValue('http://example.com');
      const pagination = plainToInstance(PaginationOptionsProduct, {
        take: 5,
        page: 1,
      });

      const result = await productsService.getMany(pagination);

      expect(result).toHaveProperty('products', expect.any(Array));
      expect(result).toHaveProperty('pagination');
    });

    it('should return a page with a specific take, a specific page and a specfic category ', async () => {
      filesService.generatePresignedUrl.mockResolvedValue('http://example.com');
      const pagination = plainToInstance(PaginationOptionsProduct, {
        take: 5,
        page: 1,
        category: categories[random()].name,
      });

      const result = await productsService.getMany(pagination);

      expect(result).toHaveProperty('products', expect.any(Array));
      expect(result).toHaveProperty('pagination');
    });

    it('should return return a error if the page is out of range ', async () => {
      const pagination = plainToInstance(PaginationOptionsProduct, {
        take: 10,
        page: 9999,
      });

      await expect(productsService.getMany(pagination)).rejects.toThrow(
        new BadRequestException('page is out of range'),
      );
    });
  });

  describe('create', () => {
    it('should create and return a product details', async () => {
      const result = await productsService.create(product);

      expect(result).toHaveProperty('name', product.name);
      expect(result).toHaveProperty('description', product.description);
      expect(result).toHaveProperty('price', product.price);
      expect(result).toHaveProperty('stock', product.stock);
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('updatedAt', expect.any(Date));
      expect(result).toHaveProperty('createdAt', expect.any(Date));
    });

    it("should throw a error if product's category doesn't exist ", async () => {
      await expect(
        productsService.create({
          ...product,
          categoryId: datatype.uuid(),
        }),
      ).rejects.toThrow(new NotFoundException('Category not found'));
    });
  });

  describe('update', () => {
    let createdProduct: Product;
    beforeEach(async () => {
      createdProduct = await productFactory.make({
        category: {
          connect: {
            id: categories[random()].id,
          },
        },
      });
    });

    it('should update and return a product details', async () => {
      filesService.generatePresignedUrl.mockResolvedValue('http://example.com');

      await imageFactory.make({
        product: {
          connect: {
            id: createdProduct.id,
          },
        },
      });

      const result = await productsService.update(createdProduct.uuid, {
        ...product,
      });

      expect(result).toHaveProperty('name', product.name);
      expect(result).toHaveProperty('description', product.description);
      expect(result).toHaveProperty('price', product.price);
      expect(result).toHaveProperty('stock', product.stock);
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('updatedAt', expect.any(Date));
      expect(result).toHaveProperty('createdAt', expect.any(Date));
    });

    it('should throw a error if product is disable', async () => {
      await prisma.product.update({
        where: {
          id: createdProduct.id,
        },
        data: {
          status: true,
          deletedAt: new Date(),
        },
      });
      await expect(
        productsService.update(createdProduct.uuid, {
          ...product,
        }),
      ).rejects.toThrow(new UnauthorizedException('Product is disable '));
    });

    it("should throw a error if product doesn't exist", async () => {
      await expect(
        productsService.update(datatype.uuid(), {
          ...product,
        }),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });

    it("should throw a error if product's category doesn't exist ", async () => {
      await expect(
        productsService.update(createdProduct.uuid, {
          ...product,
          categoryId: datatype.uuid(),
        }),
      ).rejects.toThrow(new NotFoundException('Category not found'));
    });
  });

  describe('changeStatus', () => {
    it('should  change status of a product ', async () => {
      filesService.generatePresignedUrl.mockResolvedValue('http://example.com');
      const createdProduct = await productFactory.make({
        category: {
          connect: {
            id: categories[random()].id,
          },
        },
      });

      await imageFactory.make({
        product: {
          connect: {
            id: createdProduct.id,
          },
        },
      });

      const expected = datatype.boolean();

      const result = await productsService.changeStatus(
        createdProduct.uuid,
        expected,
      );

      expect(result).toHaveProperty('name', createdProduct.name);
      expect(result).toHaveProperty('description', createdProduct.description);
      expect(result).toHaveProperty('price', createdProduct.price);
      expect(result).toHaveProperty('stock', createdProduct.stock);
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('status', expected);
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('createdAt');
    });

    it("should throw a error if product doesn't exist ", async () => {
      await expect(
        productsService.changeStatus(datatype.uuid(), datatype.boolean()),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });
  });

  describe('uploadImage', () => {
    it('should upload a image sucessfully', async () => {
      const createdProduct = await productFactory.make({
        category: {
          connect: {
            id: categories[random()].id,
          },
        },
      });
      const url = 'http://example.com';
      filesService.uploadFile.mockResolvedValue(url);

      const result = await productsService.uploadImage(createdProduct.uuid, {
        type: ImageType.jpg,
      });
      expect(result).toHaveProperty('productId');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('url', url);
    });

    it("should throw a error if the product doesn't exist", async () => {
      await expect(
        productsService.uploadImage(datatype.uuid(), {
          type: ImageType.jpg,
        }),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });
  });
});
