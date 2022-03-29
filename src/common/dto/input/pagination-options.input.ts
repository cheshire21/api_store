import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType({
  description:
    'Pagination Options Input is input type that capture take and page of pagination',
})
export class PaginationOptionsInput {
  @Field({ nullable: true })
  @IsOptional()
  take: number = 10;

  @Field({ nullable: true })
  @IsOptional()
  page: number = 1;
}
