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

@Resolver((of) => Product)
export class ProductsResolver {
  constructor(
    private productService: ProductsService,
    private likesService: LikesService,
  ) {}

  @Query((returns) => Product)
  async ProductGet(@Args('id') id: string) {
    return await this.productService.getOne(id);
  }

  @Mutation((returns) => Product)
  @Roles(Role.manager)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async ProductCreate(@Args('productInput') productInput: ProductInput) {
    return await this.productService.create(productInput);
  }
}
