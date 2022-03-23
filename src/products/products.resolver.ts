import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LikesService } from 'src/likes/likes.service';
import { Product } from './models/product.model';
import { ProductsService } from './products.service';

@Resolver((of) => Product)
export class ProductsResolver {
  constructor(
    private productService: ProductsService,
    private likesService: LikesService,
  ) {}

  @Query((returns) => Product)
  async getProduct(@Args('id') id: string) {
    return await this.productService.getOne(id);
  }
}
