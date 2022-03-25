import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProductsService } from 'src/products/products.service';
import { OrderItem } from '../models/order-item.model';

@Resolver(() => OrderItem)
export class OrderItemResolver {
  constructor(private productsService: ProductsService) {}

  @ResolveField()
  async product(@Parent() orderItem) {
    const { product } = orderItem;

    return await this.productsService.getOne(product.uuid);
  }
}
