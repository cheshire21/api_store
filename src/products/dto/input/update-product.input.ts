import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class UpdateProductInput {
  @Field()
  @IsOptional()
  name?: string;

  @Field()
  @IsOptional()
  description?: string;

  @Field(() => Float)
  @IsOptional()
  price?: number;

  @Field(() => Int)
  @IsOptional()
  stock?: number;

  @Field()
  @IsOptional()
  categoryId?: string;
}
