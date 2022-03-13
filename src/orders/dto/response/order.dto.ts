import { Exclude, Expose } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

@Exclude()
export class ResponseOrderDto {
  @Expose()
  uuid: string;

  @Expose()
  totalPrice: number;

  @Expose()
  createdAt: Date;

  @Expose()
  items: OrderItemDto[];
}
