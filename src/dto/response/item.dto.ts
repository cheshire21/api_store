import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { commerce, datatype } from 'faker';
import { ProductDetails } from '../../carts/dto/response/product-details.dto';

@Exclude()
export class ItemDto {
  @ApiProperty()
  @Expose()
  product: ProductDetails;

  @ApiProperty({
    example: datatype.number(),
  })
  @Expose()
  quantity: number;

  @ApiProperty({
    example: commerce.price(),
  })
  @Expose()
  unitPrice: number;

  @ApiProperty({
    example: commerce.price(),
  })
  @Expose()
  totalPrice: number;
}
