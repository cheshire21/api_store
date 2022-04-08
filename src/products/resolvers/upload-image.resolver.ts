import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { UploadImage } from '../models/upload-image.model';
import { ProductsService } from '../services/products.service';

@Resolver(() => UploadImage)
export class UploadImagesResolver {
  constructor(private productsService: ProductsService) {}
  @ResolveField()
  async product(@Parent() image) {
    const { productId } = image;

    return await this.productsService.getOne(productId);
  }
}
