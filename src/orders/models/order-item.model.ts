import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Product } from 'src/products/models/product.model';

@ObjectType()
export class OrderItem {
  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  totalPrice: number;

  @Field()
  product: Product;
}
