import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from './product.model';

@ObjectType()
export class Image {
  @Field()
  uuid: string;

  @Field()
  url: string;

  @Field((type) => Product)
  product: Product;
}
