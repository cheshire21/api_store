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

  @Field((type) => Float)
  price: number;

  @Field((type) => Int)
  stock: number;

  @Field((type) => Category)
  category: Category;

  @Field((type) => Int)
  likes: number;

  @Field((type) => Int)
  dislikes: number;

  @Field((type) => [Image], {
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
