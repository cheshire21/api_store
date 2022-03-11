import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { commerce, datatype } from 'faker';

@Exclude()
export class CategoryDetails {
  @ApiProperty({
    example: datatype.uuid(),
  })
  @Expose()
  uuid: string;

  @ApiProperty({
    example: commerce.productMaterial(),
  })
  @Expose()
  name: string;
}
