import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

interface IPageInfo {
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  nextPage?: number;
  previousPage?: number;
}

interface IEdgeType<T> {
  cursor: string;
  node: T;
}

export interface IPaginatedType<T> {
  edges: IEdgeType<T>[];
  pageInfo: IPageInfo;
}

export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field((type) => String)
    cursor: string;

    @Field((type) => classRef)
    node: T;
  }

  @ObjectType()
  abstract class PageInfo {
    @Field(() => Int)
    totalPages: number;
    @Field(() => Int)
    itemsPerPage: number;
    @Field(() => Int)
    totalItems: number;
    @Field(() => Int)
    currentPage: number;
    @Field(() => Int)
    nextPage?: number;
    @Field(() => Int)
    previousPage?: number;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field((type) => [EdgeType], { nullable: 'items' })
    edges: EdgeType[];

    @Field()
    pageInfo: PageInfo;
  }

  return PaginatedType as Type<IPaginatedType<T>>;
}
