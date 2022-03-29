import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Category } from './category.model';
import { Image } from './image.model';

@ObjectType()
export class Product {
  @Field({ description: 'Product uuid' })
  uuid: string;

  @Field({ description: "Product's name" })
  name: string;

  @Field({ description: "Product's description" })
  description: string;

  @Field(() => Float, { description: "Product's price" })
  price: number;

  @Field(() => Int, { description: "Product's stock" })
  stock: number;

  @Field(() => Category, { description: "Product's category" })
  category: Category;

  @Field(() => Int, { description: "Product's likes quantity" })
  likes: number;

  @Field(() => Int, { description: "Product's dislikes quantity" })
  dislikes: number;

  @Field(() => [Image], {
    nullable: 'items',
    description: "Product's imagess",
  })
  images: Image[];

  @Field({ description: "Product's status" })
  status: boolean;

  @Field({ nullable: true, description: "Prduct's deleted date" })
  deletedAt: Date;

  @Field({ description: "Product's updated date " })
  updatedAt: Date;

  @Field({ description: "Product's created date " })
  createdAt: Date;
}
