import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Image } from '../models/image.model';
import { ProductsService } from '../services/products.service';

@Resolver(() => Image)
export class ImagesResolver {
  constructor(private productsService: ProductsService) {}
  @ResolveField()
  async product(@Parent() image) {
    const { productId } = image;

    return await this.productsService.getOne(productId);
  }
}
