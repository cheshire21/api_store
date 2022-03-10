import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { commerce, datatype, name } from 'faker';

@Exclude()
export class ResponseProductDto {
  @ApiProperty({
    example: datatype.uuid(),
  })
  @Expose()
  uuid: string;

  @ApiProperty({
    example: name.firstName(),
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: name.lastName(),
  })
  @Expose()
  description: string;

  @ApiProperty({
    example: datatype.float(),
  })
  @Expose()
  price: number;

  @ApiProperty({
    example: datatype.number(),
  })
  @Expose()
  stock: number;

  @ApiProperty({
    example: {
      uuid: datatype.uuid(),
      name: commerce.productName(),
    },
  })
  @Expose()
  category: { uuid: string; name: string };

  @ApiProperty({
    example: datatype.boolean(),
  })
  @Expose()
  status: boolean;

  @ApiProperty({
    example: null,
  })
  @Expose()
  deletedAt: string;

  @ApiProperty({
    example: datatype.datetime(),
  })
  @Expose()
  updatedAt: string;

  @ApiProperty({
    example: datatype.datetime(),
  })
  @Expose()
  createdAt: string;
}
