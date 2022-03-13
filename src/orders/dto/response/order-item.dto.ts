import { Exclude, Expose } from 'class-transformer';
import { ProductDetails } from '../../../carts/dto/response/product-details.dto';

@Exclude()
export class OrderItemDto {
  @Expose()
  product: ProductDetails;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  totalPrice: number;
}
