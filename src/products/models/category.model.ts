import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field({ description: 'Category id' })
  uuid: string;

  @Field({ description: 'Category name' })
  name: string;
}
