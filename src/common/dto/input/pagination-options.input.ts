import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType({ isAbstract: true })
export class PaginationOptionsInput {
  @Field()
  @IsOptional()
  take: number = 10;

  @Field()
  @IsOptional()
  page: number = 1;
}
