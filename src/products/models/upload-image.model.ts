import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from './product.model';

@ObjectType()
export class UploadImage {
  @Field({ description: 'Image id' })
  uuid: string;

  @Field({ description: 'Pre signed url to upload image' })
  url: string;

  @Field((type) => Product, { description: 'Product to which image belongs' })
  product: Product;
}
