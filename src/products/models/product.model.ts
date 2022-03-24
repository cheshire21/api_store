import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Category } from './category.model';
import { Image } from './image.model';

@ObjectType()
export class Product {
  @Field()
  uuid: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field(() => Category)
  category: Category;

  @Field(() => Int)
  likes: number;

  @Field(() => Int)
  dislikes: number;

  @Field(() => [Image], {
    nullable: 'items',
  })
  images: Image[];

  @Field()
  status: boolean;

  @Field({ nullable: true })
  deletedAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  createdAt: Date;
}
