import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductDetails {
  @Expose()
  uuid: string;

  @Expose()
  name: string;
}
