import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class ProductInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNotEmpty()
  description: string;

  @Field(() => Float)
  @IsNotEmpty()
  price: number;

  @Field(() => Int)
  @IsNotEmpty()
  stock: number;

  @Field()
  @IsNotEmpty()
  categoryId: string;
}
