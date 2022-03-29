import { PaginationOptionsInput } from 'src/common/dto/input/pagination-options.input';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType({
  description:
    'Pagination Options Input is input type that capture pagination options(take and page) and category string to search products with similar category name',
})
export class PaginationOptionsProductInput extends PaginationOptionsInput {
  @Field({
    description:
      'string to search product that belong to category with similar name',
  })
  @IsOptional()
  category: string = null;
}
