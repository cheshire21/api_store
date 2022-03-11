import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { commerce, datatype } from 'faker';

@Exclude()
export class UpdateProductDto {
  @ApiProperty({
    required: false,
    example: commerce.productName(),
  })
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    required: false,
    example: commerce.productDescription(),
  })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    example: commerce.price(),
  })
  @Expose()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    required: false,
    example: datatype.number(),
  })
  @Expose()
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({
    required: false,
    example: datatype.uuid(),
  })
  @Expose()
  @IsOptional()
  @IsString()
  categoryId?: string;
}
