import { Exclude, Expose } from 'class-transformer';
import { ItemDto } from './item.dto';

@Exclude()
export class CartItemsDto {
  @Expose()
  totalPrice: number;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  items: ItemDto[];
}
