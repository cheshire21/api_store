import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { commerce, datatype } from 'faker';

@Exclude()
export class CreateProductDto {
  @ApiProperty({
    example: commerce.productName(),
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: commerce.productDescription(),
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: commerce.price(),
  })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    example: datatype.number(),
  })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @ApiProperty({
    example: datatype.uuid(),
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  categoryId: string;
}
