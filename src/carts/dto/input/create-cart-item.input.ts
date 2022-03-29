import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

@InputType({
  description:
    'Car item input is a input type that has information to create or update a cart item',
})
export class CartItemInput {
  @Field({ description: 'product id that user add or update in cart' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @Field(() => Int, {
    description: 'quantity of product that user add or update',
  })
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  quantity: number;
}
