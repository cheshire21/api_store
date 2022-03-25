import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { ProductsService } from 'src/products/products.service';
import { CartItem } from './models/cart-item.model';

@Resolver(() => CartItem)
export class CartItemsResolver {
  constructor(private productsService: ProductsService) {}

  @ResolveField()
  async product(@Parent() cartItem) {
    const { product } = cartItem;
    console.log(cartItem);
    return this.productsService.getOne(product.uuid);
  }
}
