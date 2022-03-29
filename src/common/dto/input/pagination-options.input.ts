import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class PaginationOptionsInput {
  @Field({ nullable: true })
  @IsOptional()
  take: number = 10;

  @Field({ nullable: true })
  @IsOptional()
  page: number = 1;
}
