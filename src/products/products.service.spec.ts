import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Category, Product } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { commerce, datatype } from 'faker';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryFactory } from '../utils/factories/category.factory';
import { ProductFactory } from '../utils/factories/product.factory';
import { CreateProductDto } from './dto/request/create-product.dto';
import { PaginationOptionsProduct } from './dto/request/pag-product.dto';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let prisma: PrismaService;

  let productFactory: ProductFactory;
  let categoryFactory: CategoryFactory;

  let categories: Category[];
  let product: CreateProductDto;
  let length: number = 3;

  let random = () => Math.floor(Math.random() * length);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);

    productFactory = new ProductFactory(prisma);
    categoryFactory = new CategoryFactory(prisma);

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

      const result = await productsService.getOne(createdProduct.uuid);

      expect(result).toHaveProperty('name', createdProduct.name);
      expect(result).toHaveProperty('description', createdProduct.description);
      expect(result).toHaveProperty('price', createdProduct.price);
      expect(result).toHaveProperty('stock', createdProduct.stock);
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('status', createdProduct.status);
      expect(result).toHaveProperty('updatedAt', createdProduct.updatedAt);
      expect(result).toHaveProperty('createdAt', createdProduct.createdAt);
    });

    it("should throw a error if product doesn't exist", async () => {
      await expect(productsService.getOne(datatype.uuid())).rejects.toThrow(
        new HttpException("Product doesn't exist", HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getMany', () => {
    beforeAll(async () => {
      for (let i = 0; i < length; i++) {
        await productFactory.makeMany(4, {
          category: {
            connect: {
              id: categories[i].id,
            },
          },
        });
      }
    });

    it('should return a page with a specific take and a specific page', async () => {
      const pagination = plainToInstance(PaginationOptionsProduct, {
        take: 5,
        page: 1,
      });

      const result = await productsService.getMany(pagination);

      expect(result).toHaveProperty('products', expect.any(Array));
      expect(result).toHaveProperty('pagination');
    });

    it('should return a page with a specific take, a specific page and a specfic category ', async () => {
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
        new HttpException('page is out of range', HttpStatus.BAD_REQUEST),
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
      ).rejects.toThrow(
        new HttpException('Category not found', HttpStatus.NOT_FOUND),
      );
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
      ).rejects.toThrow(
        new HttpException('Product is disable ', HttpStatus.UNAUTHORIZED),
      );
    });

    it("should throw a error if product doesn't exist", async () => {
      await expect(
        productsService.update(datatype.uuid(), {
          ...product,
        }),
      ).rejects.toThrow(
        new HttpException('Product not found', HttpStatus.NOT_FOUND),
      );
    });

    it("should throw a error if product's category doesn't exist ", async () => {
      await expect(
        productsService.update(createdProduct.uuid, {
          ...product,
          categoryId: datatype.uuid(),
        }),
      ).rejects.toThrow(
        new HttpException('Category not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('changeStatus', () => {
    it('should  change status of a product ', async () => {
      let createdProduct = await productFactory.make({
        category: {
          connect: {
            id: categories[random()].id,
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
      ).rejects.toThrow(
        new HttpException('Product not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
