import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { commerce, datatype } from 'faker';

@Exclude()
export class ProductDetails {
  @ApiProperty({
    example: datatype.uuid(),
  })
  @Expose()
  uuid: string;

  @ApiProperty({
    example: commerce.productName(),
  })
  @Expose()
  name: string;
}
