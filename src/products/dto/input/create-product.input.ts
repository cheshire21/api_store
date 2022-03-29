import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType({
  description:
    'Product Input is a input type that capture product information necesary to create a product',
})
export class ProductInput {
  @Field({ description: "Product's name" })
  @IsNotEmpty()
  name: string;

  @Field({ description: "Product's description" })
  @IsNotEmpty()
  description: string;

  @Field(() => Float, { description: "Product's price" })
  @IsNotEmpty()
  price: number;

  @Field(() => Int, { description: "Product's stock" })
  @IsNotEmpty()
  stock: number;

  @Field({ description: "Product's category id" })
  @IsNotEmpty()
  categoryId: string;
}
