import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
  @Field(() => Int, { description: 'total pages' })
  totalPages: number;

  @Field(() => Int, { description: 'nodes per page' })
  itemsPerPage: number;

  @Field(() => Int, { description: 'total records' })
  totalItems: number;

  @Field(() => Int, { description: 'current page' })
  currentPage: number;

  @Field(() => Int, { description: 'next page' })
  nextPage?: number;

  @Field(() => Int, { description: 'previous page' })
  previousPage?: number;
}
