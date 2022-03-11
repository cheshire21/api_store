import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ItemDto {
  @Expose()
  product: {
    uuid: string;
    name: string;
  };

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  totalPrice: number;
}
