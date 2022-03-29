import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Product } from '../../products/models/product.model';

@ObjectType()
export class CartItem {
  @Field(() => Int, { description: "Car item's quantity" })
  quantity: number;

  @Field(() => Float, { description: "Car item's unit price" })
  unitPrice: number;

  @Field(() => Float, { description: "Car item's total price" })
  totalPrice: number;

  @Field({ description: "Car item's Product information" })
  product: Product;
}
