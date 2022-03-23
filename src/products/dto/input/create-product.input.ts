import { Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class ProductInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field((type) => Float)
  price: number;

  @Field((type) => Int)
  stock: number;

  @Field()
  categoryId: string;
}
