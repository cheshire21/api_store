import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Category, Product } from '@prisma/client';
import { commerce, datatype } from 'faker';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryFactory } from '../utils/factories/category.factory';
import { ProductFactory } from '../utils/factories/product.factory';
import { CreateProductDto } from './dto/request/create-product.dto';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let prisma: PrismaService;

  let productFactory: ProductFactory;
  let categoryFactory: CategoryFactory;

  let categories: Category[];
  let product: CreateProductDto;
  let length: number;

  let random = () => Math.floor(Math.random() * length);
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);

    productFactory = new ProductFactory(prisma);
    categoryFactory = new CategoryFactory(prisma);

    categories = await categoryFactory.makeMany(3);

    length = categories.length;
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
      expect(result).toHaveProperty('isActive', createdProduct.isActive);
      expect(result).toHaveProperty('updatedAt', createdProduct.updatedAt);
      expect(result).toHaveProperty('createdAt', createdProduct.createdAt);
    });

    it("should throw a error if product doesn't exist", async () => {
      await expect(productsService.getOne(datatype.uuid())).rejects.toThrow(
        new HttpException("Product doesn't exist", HttpStatus.NOT_FOUND),
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
      expect(result).toHaveProperty('isActive');
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
    beforeAll(async () => {
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
        isActive: datatype.boolean(),
      });

      expect(result).toHaveProperty('name', product.name);
      expect(result).toHaveProperty('description', product.description);
      expect(result).toHaveProperty('price', product.price);
      expect(result).toHaveProperty('stock', product.stock);
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('isActive');
      expect(result).toHaveProperty('updatedAt', expect.any(Date));
      expect(result).toHaveProperty('createdAt', expect.any(Date));
    });

    it("should throw a error if product's category doesn't exist ", async () => {
      await expect(
        productsService.update(createdProduct.uuid, {
          ...product,
          isActive: datatype.boolean(),
          categoryId: datatype.uuid(),
        }),
      ).rejects.toThrow(
        new HttpException(
          'Category or product not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it("should throw a error if product doesn't exist", async () => {
      await expect(
        productsService.update(datatype.uuid(), {
          ...product,
          isActive: datatype.boolean(),
        }),
      ).rejects.toThrow(
        new HttpException(
          'Category or product not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('delete', () => {
    it('should  delete a product ', async () => {
      let createdProduct = await productFactory.make({
        category: {
          connect: {
            id: categories[random()].id,
          },
        },
      });

      const result = await productsService.delete(createdProduct.uuid);

      expect(result).toHaveProperty('name', createdProduct.name);
      expect(result).toHaveProperty('description', createdProduct.description);
      expect(result).toHaveProperty('price', createdProduct.price);
      expect(result).toHaveProperty('stock', createdProduct.stock);
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('isActive');
      expect(result).toHaveProperty('deletedAt', expect.any(Date));
      expect(result).toHaveProperty('updatedAt', expect.any(Date));
      expect(result).toHaveProperty('createdAt', expect.any(Date));
    });

    it("should throw a error if product doesn't exist ", async () => {
      await expect(productsService.delete(datatype.uuid())).rejects.toThrow(
        new HttpException('Product not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  // describe('changeStatus', () => {
  //   it('should  change status of a product ', async () => {
  //     let createdProduct = await productFactory.make();
  //     const expected = datatype.boolean();

  //     const result = await productsService.changeStatus(
  //       createdProduct.uuid,
  //       expected,
  //     );

  //     expect(result).toHaveProperty('name', product.name);
  //     expect(result).toHaveProperty('description', product.description);
  //     expect(result).toHaveProperty('price', product.price);
  //     expect(result).toHaveProperty('stock', product.stock);
  //     expect(result).toHaveProperty('category');
  //     expect(result).toHaveProperty('isActive', expected);
  //     expect(result).toHaveProperty('updatedAt');
  //     expect(result).toHaveProperty('createdAt');
  //   });

  //   it("should throw a error if product doesn't exist ", () => {});
  // });
});
