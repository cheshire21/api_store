import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType({ description: 'Update Product Input is a input type that ' })
export class UpdateProductInput {
  @Field({ description: 'Name of product to update' })
  @IsOptional()
  name?: string;

  @Field({ description: 'Description of product to update' })
  @IsOptional()
  description?: string;

  @Field(() => Float, { description: 'Price of product to update' })
  @IsOptional()
  price?: number;

  @Field(() => Int, { description: 'Stock of product to update' })
  @IsOptional()
  stock?: number;

  @Field({ description: 'Category id of product to update' })
  @IsOptional()
  categoryId?: string;
}
