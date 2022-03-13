import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { datatype } from 'faker';
import { ItemDto } from '../../../dto/response/item.dto';

@Exclude()
export class ResponseOrderDto {
  @ApiProperty({
    example: datatype.uuid(),
  })
  @Expose()
  uuid: string;

  @ApiProperty({
    example: datatype.number(),
  })
  @Expose()
  totalPrice: number;

  @ApiProperty({
    example: datatype.datetime(),
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    type: [ItemDto],
  })
  @Expose()
  items: ItemDto[];
}
