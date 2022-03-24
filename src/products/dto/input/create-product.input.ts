import { ArgsType, Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class ProductInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  price: number;

  @Field()
  stock: number;

  @Field()
  categoryId: string;
}
