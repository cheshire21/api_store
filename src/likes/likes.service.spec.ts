import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Category, Product, User } from '@prisma/client';
import { datatype } from 'faker';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryFactory } from 'src/utils/factories/category.factory';
import { LikeFactory } from 'src/utils/factories/like.factory';
import { ProductFactory } from 'src/utils/factories/product.factory';
import { UserFactory } from 'src/utils/factories/user.factory';
import { LikesService } from './likes.service';

describe('LikesService', () => {
  let likesService: LikesService;
  let prisma: PrismaService;

  let userFactory: UserFactory;
  let productFactory: ProductFactory;
  let categoryFactory: CategoryFactory;
  let likeFactory: LikeFactory;

  let categories: Category[];
  let categoriesLength: number = 3;
  let products: Product[];
  let productstLength: number = 2;
  let createduser: User;

  let random = (length) => Math.floor(Math.random() * length);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LikesService, PrismaService],
    }).compile();

    likesService = module.get<LikesService>(LikesService);
    prisma = module.get<PrismaService>(PrismaService);

    likeFactory = new LikeFactory(prisma);
    userFactory = new UserFactory(prisma);
    productFactory = new ProductFactory(prisma);
    categoryFactory = new CategoryFactory(prisma);

    createduser = await userFactory.make();

    categories = await categoryFactory.makeMany(length);

    for (let i = 0; i < categoriesLength; i++) {
      const arr = await productFactory.makeMany(productstLength, {
        category: {
          connect: {
            id: categories[i].id,
          },
        },
      });
      products.push(...arr);
    }
  });

  describe('create or update like', () => {
    it('should create a like', async () => {
      const result = await likesService.upsertLike(
        createduser.uuid,
        products[random(productstLength)].uuid,
        { like: datatype.boolean() },
      );

      expect(result).toBeUndefined();
    });

    it('should update a like', async () => {
      const pos = random(productstLength);

      await likeFactory.make({
        user: {
          connect: {
            id: createduser.id,
          },
        },
        product: {
          connect: {
            id: products[pos].id,
          },
        },
        like: datatype.boolean(),
      });

      const result = await likesService.upsertLike(
        createduser.uuid,
        products[pos].uuid,
        { like: datatype.boolean() },
      );

      expect(result).toBeUndefined();
    });

    it("should return a error if user doesn't exist", async () => {
      await expect(
        likesService.upsertLike(
          datatype.uuid(),
          products[random(productstLength)].uuid,
          {
            like: datatype.boolean(),
          },
        ),
      ).rejects.toThrow(
        new HttpException('User or Product not found', HttpStatus.NOT_FOUND),
      );
    });

    it("should return a error if product doesn't exist", async () => {
      await expect(
        likesService.upsertLike(createduser.uuid, datatype.uuid(), {
          like: datatype.boolean(),
        }),
      ).rejects.toThrow(
        new HttpException('User or Product not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('deleteLike', () => {
    it('should delete like sucessfully', async () => {
      const pos = random(productstLength);

      await likeFactory.make({
        user: {
          connect: {
            id: createduser.id,
          },
        },
        product: {
          connect: {
            id: products[pos].id,
          },
        },
        like: datatype.boolean(),
      });

      expect(
        await likesService.deleteLike(createduser.uuid, products[pos].uuid),
      ).toBeUndefined();
    });

    it('should return a error if the product doesnt exist', async () => {
      await expect(
        likesService.deleteLike(createduser.uuid, datatype.uuid()),
      ).rejects.toThrow(
        new HttpException('User or Product not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should return a error if the user doesnt exist', async () => {
      await expect(
        likesService.deleteLike(
          datatype.uuid(),
          products[random(productstLength)].uuid,
        ),
      ).rejects.toThrow(
        new HttpException('User or Product not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
