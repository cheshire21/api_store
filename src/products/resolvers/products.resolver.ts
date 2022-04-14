import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlGetUser } from 'src/auth/decorators/gql-get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { GqlJwtGuard } from 'src/auth/guards/gql-jwt.guard';
import { GqlRolesGuard } from 'src/auth/guards/gql-role.guard';
import { Message } from 'src/common/dto/input/message.model';
import { Role } from 'src/common/enums';
import { LikesService } from 'src/likes/services/likes.service';
import { ProductInput } from '../dto/input/create-product.input';
import { ImageInput } from '../dto/input/image.input';
import { LikeInput } from '../dto/input/like.dto';
import { PaginationOptionsProductInput } from '../dto/input/pagination-product.input';
import { StatusInput } from '../dto/input/status-product.input';
import { UpdateProductInput } from '../dto/input/update-product.input';
import { Image } from '../models/image.model';
import { Product } from '../models/product.model';
import { PaginatedProduct } from '../models/products.model';
import { UploadImage } from '../models/upload-image.model';
import { ProductsService } from '../services/products.service';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private productService: ProductsService,
    private likesService: LikesService,
  ) {}

  @Query(() => Product, { description: 'query that return a specific product' })
  async productGetOne(@Args('id') id: string) {
    return await this.productService.getOne(id);
  }

  @Query(() => PaginatedProduct, {
    description: 'query that return a list of products',
  })
  async productGetMany(
    @Args('paginationOptionsProduct')
    paginationOptionsProduct: PaginationOptionsProductInput,
  ) {
    const { products, pagination } = await this.productService.getMany(
      paginationOptionsProduct,
    );

    const data = products.map((product) => {
      return {
        node: {
          ...product,
        },
      };
    });

    return {
      edges: data,
      pageInfo: pagination,
    };
  }

  @Mutation(() => Product, { description: 'mutation that create a product' })
  @Roles(Role.manager)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async productCreate(@Args('productInput') productInput: ProductInput) {
    return await this.productService.create(productInput);
  }

  @Mutation(() => Product, { description: 'mutation that update a product' })
  @Roles(Role.manager)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async productUpdate(
    @Args('id') id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return await this.productService.update(id, updateProductInput);
  }

  @Mutation(() => Product, {
    description: 'mutation that change a product status',
  })
  @Roles(Role.manager)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async productChangeStatus(
    @Args('id') id: string,
    @Args('statusInput') statusInput: StatusInput,
  ) {
    const { status } = statusInput;
    return await this.productService.changeStatus(id, status);
  }

  @Mutation(() => UploadImage, {
    description:
      'mutation that create a presigne url and return a url to upload image',
  })
  @Roles(Role.manager)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async productUploadImage(
    @Args('id') id: string,
    @Args('imageInput') imageInput: ImageInput,
  ) {
    return await this.productService.uploadImage(id, imageInput);
  }

  @Mutation(() => Message, {
    description: 'mutation that create or update a like in a product',
  })
  @Roles(Role.manager, Role.client)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async productCreateOrUpdateLike(
    @GqlGetUser() user,
    @Args('id') id: string,
    @Args('likeInput') likeInput: LikeInput,
  ) {
    const likeExist = await this.likesService.upsertLike(
      user.uuid,
      id,
      likeInput,
    );
    if (likeExist) {
      return {
        message: 'Like was Created or Updated',
        time: new Date(),
      };
    }
  }

  @Mutation(() => Message, { description: 'mutation that delete a like' })
  @Roles(Role.manager, Role.client)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async productDeleteLike(@GqlGetUser() user, @Args('id') id: string) {
    const likeWasDeleted = await this.likesService.deleteLike(user.uuid, id);

    if (likeWasDeleted) {
      return {
        message: 'Like was Deleted',
        time: new Date(),
      };
    }
  }
}
