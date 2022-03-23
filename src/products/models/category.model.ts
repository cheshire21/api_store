import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field()
  uuid: string;

  @Field()
  name: string;
}
