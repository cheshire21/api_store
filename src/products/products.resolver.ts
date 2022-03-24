import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/decorators/role.decorator';
import { GqlJwtGuard } from 'src/auth/guards/gql-jwt.guard';
import { GqlRolesGuard } from 'src/auth/guards/gql-role.guard';
import { Role } from 'src/common/enums';
import { LikesService } from 'src/likes/likes.service';
import { ProductInput } from './dto/input/create-product.input';
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
}
