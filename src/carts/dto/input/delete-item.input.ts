import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CartItemDeleteInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  productId: string;
}
