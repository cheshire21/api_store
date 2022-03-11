import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { datatype } from 'faker';
import { ProductDetails } from './product-details.dto';

@Exclude()
export class ResponseCartDto {
  @ApiProperty()
  @Expose()
  product: ProductDetails;

  @ApiProperty({
    example: datatype.number(),
  })
  @Expose()
  quantity: number;

  @ApiProperty({
    example: datatype.float(),
  })
  @Expose()
  unitPrice: number;

  @ApiProperty({
    example: datatype.float(),
  })
  @Expose()
  totalPrice: number;
}
