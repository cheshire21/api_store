import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

@InputType()
export class CartItemInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  productId: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  quantity: number;
}
