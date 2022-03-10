import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsNumber, IsString } from 'class-validator';
import { commerce, datatype, name } from 'faker';

@Exclude()
export class UpdateProductDto {
  @ApiProperty({
    required: false,
    example: name.firstName(),
  })
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    required: false,
    example: name.lastName(),
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
