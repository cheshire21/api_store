import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from './product.model';

@ObjectType()
export class Image {
  @Field({ description: 'Image id' })
  uuid: string;

  @Field({ description: "Image's url" })
  url: string;

  @Field((type) => Product, {
    description: 'Product to which the image belongs',
  })
  product: Product;
}
