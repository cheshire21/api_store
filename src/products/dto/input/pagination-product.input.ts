import { PaginationOptionsInput } from 'src/common/dto/input/pagination-options.input';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class PaginationOptionsProductInput extends PaginationOptionsInput {
  @Field()
  @IsOptional()
  category: string = null;
}
