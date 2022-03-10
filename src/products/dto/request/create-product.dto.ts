import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { commerce, datatype, name } from 'faker';

@Exclude()
export class CreateProductDto {
  @ApiProperty({
    example: name.firstName(),
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: name.lastName(),
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
