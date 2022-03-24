import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/decorators/role.decorator';
import { GqlJwtGuard } from 'src/auth/guards/gql-jwt.guard';
import { GqlRolesGuard } from 'src/auth/guards/gql-role.guard';
import { Role } from 'src/common/enums';
import { LikesService } from 'src/likes/likes.service';
import { ProductInput } from './dto/input/create-product.input';
import { ImageInput } from './dto/input/image.input';
import { StatusInput } from './dto/input/status-product.input';
import { UpdateProductInput } from './dto/input/update-product.input';
import { Image } from './models/image.model';
import { Product } from './models/product.model';
import { ProductsService } from './products.service';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private productService: ProductsService,
    private likesService: LikesService,
  ) {}

  @Query(() => Product)
  async productGet(@Args('id') id: string) {
    return await this.productService.getOne(id);
  }

  @Mutation(() => Product)
  @Roles(Role.manager)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async productCreate(@Args('productInput') productInput: ProductInput) {
    return await this.productService.create(productInput);
  }

  @Mutation(() => Product)
  @Roles(Role.manager)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async productUpdate(
    @Args('id') id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return await this.productService.update(id, updateProductInput);
  }

  @Mutation(() => Product)
  @Roles(Role.manager)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async productChangeStatus(
    @Args('id') id: string,
    @Args('statusInput') statusInput: StatusInput,
  ) {
    const { status } = statusInput;
    return await this.productService.changeStatus(id, status);
  }

  @Mutation(() => Image)
  @Roles(Role.manager)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async productUploadImage(
    @Args('id') id: string,
    @Args('imageInput') imageInput: ImageInput,
  ) {
    console.log(id);
    console.log(imageInput);

    return await this.productService.uploadImage(id, imageInput);
  }
}
