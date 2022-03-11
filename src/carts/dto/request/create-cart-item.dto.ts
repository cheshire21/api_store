import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsNumber, IsPositive, IsString } from 'class-validator';
import { datatype } from 'faker';

@Exclude()
export class CreateCartItemDto {
  @ApiProperty({
    example: datatype.uuid(),
  })
  @Expose()
  @IsString()
  productId: string;

  @ApiProperty({
    example: datatype.number(),
  })
  @Expose()
  @IsPositive()
  @IsInt()
  quantity: number;
}
