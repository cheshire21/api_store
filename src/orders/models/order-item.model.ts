import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Product } from 'src/products/models/product.model';

@ObjectType()
export class OrderItem {
  @Field(() => Int, { description: "Order item's quantity" })
  quantity: number;

  @Field(() => Float, { description: 'Product unit price' })
  unitPrice: number;

  @Field(() => Float, { description: "Order item's total price" })
  totalPrice: number;

  @Field({ description: 'Product information' })
  product: Product;
}
