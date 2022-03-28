import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

interface PageInfo {
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
  pageInfo: PageInfo;
}

export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field((type) => String)
    cursor: string;

    @Field((type) => classRef)
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field((type) => [EdgeType], { nullable: true })
    edges: EdgeType[];

    @Field()
    pageInfo: PageInfo;
  }
  return PaginatedType as Type<IPaginatedType<T>>;
}
