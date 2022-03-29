import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType({
  description:
    'Cart Item Delete Input is a input type that has a product id to delete in cart',
})
export class CartItemDeleteInput {
  @Field({ description: 'product id' })
  @IsNotEmpty()
  @IsString()
  productId: string;
}
