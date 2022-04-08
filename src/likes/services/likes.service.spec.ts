import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Category, Product, User } from '@prisma/client';
import { datatype } from 'faker';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryFactory } from '../../products/factories/category.factory';
import { LikeFactory } from '../factories/like.factory';
import { ProductFactory } from '../../products/factories/product.factory';
import { UserFactory } from '../../users/factories/user.factory';
import { LikesService } from './likes.service';

describe('LikesService', () => {
  let likesService: LikesService;
  let prisma: PrismaService;

  let userFactory: UserFactory;
  let productFactory: ProductFactory;
  let categoryFactory: CategoryFactory;
  let likeFactory: LikeFactory;

  let category: Category;
  let product: Product;
  let createduser: User;

  beforeAll(async () => {
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

    category = await categoryFactory.make();
  });

  beforeEach(async () => {
    product = await productFactory.make({
      category: {
        connect: {
          id: category.id,
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.clearDB();
    await prisma.$disconnect();
  });

  describe('create or update like', () => {
    it('should create a like', async () => {
      const result = await likesService.upsertLike(
        createduser.uuid,
        product.uuid,
        { like: datatype.boolean() },
      );

      expect(result).toBe(true);
    });

    it('should update a like', async () => {
      await likeFactory.make({
        user: {
          connect: {
            id: createduser.id,
          },
        },
        product: {
          connect: {
            id: product.id,
          },
        },
        like: datatype.boolean(),
      });

      const result = await likesService.upsertLike(
        createduser.uuid,
        product.uuid,
        { like: datatype.boolean() },
      );

      expect(result).toBe(true);
    });

    it("should return a error if user doesn't exist", async () => {
      await expect(
        likesService.upsertLike(datatype.uuid(), product.uuid, {
          like: datatype.boolean(),
        }),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it("should return a error if product doesn't exist", async () => {
      await expect(
        likesService.upsertLike(createduser.uuid, datatype.uuid(), {
          like: datatype.boolean(),
        }),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });
  });

  describe('deleteLike', () => {
    it('should delete like sucessfully', async () => {
      await likeFactory.make({
        user: {
          connect: {
            id: createduser.id,
          },
        },
        product: {
          connect: {
            id: product.id,
          },
        },
        like: datatype.boolean(),
      });

      expect(
        await likesService.deleteLike(createduser.uuid, product.uuid),
      ).toBe(true);
    });

    it('should return a error if like doesnt exist', async () => {
      await expect(
        likesService.deleteLike(createduser.uuid, product.uuid),
      ).rejects.toThrow(new NotFoundException('Like no found'));
    });

    it('should return a error if the product doesnt exist', async () => {
      await expect(
        likesService.deleteLike(createduser.uuid, datatype.uuid()),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });

    it('should return a error if the user doesnt exist', async () => {
      await expect(
        likesService.deleteLike(datatype.uuid(), product.uuid),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });
  });
});
