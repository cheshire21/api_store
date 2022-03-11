import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { datatype } from 'faker';
import { ItemDto } from './item.dto';

@Exclude()
export class CartItemsDto {
  @ApiProperty({
    example: datatype.float(),
  })
  @Expose()
  totalPrice: number;

  @ApiProperty({
    example: datatype.datetime(),
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    example: datatype.datetime(),
  })
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  items: ItemDto[];
}
