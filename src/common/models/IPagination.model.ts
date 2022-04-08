import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { PageInfo } from './page-info.model';

interface IPageInfo {
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  nextPage?: number;
  previousPage?: number;
}

interface IEdgeType<T> {
  node: T;
}

export interface IPaginatedType<T> {
  edges: IEdgeType<T>[];
  pageInfo: IPageInfo;
}
//mixen function
//uso de genericos
export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field((type) => classRef, { description: `${classRef.name} infomation` })
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field((type) => [EdgeType], { nullable: 'items' })
    edges: EdgeType[];

    @Field({ description: 'pagination info' })
    pageInfo: PageInfo;
  }

  return PaginatedType as Type<IPaginatedType<T>>;
}
