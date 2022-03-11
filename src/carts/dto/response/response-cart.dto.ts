import { Exclude, Expose } from 'class-transformer';
import { ProductDetails } from './product-details.dto';

@Exclude()
export class ResponseCartDto {
  @Expose()
  product: ProductDetails;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  totalPrice: number;
}
