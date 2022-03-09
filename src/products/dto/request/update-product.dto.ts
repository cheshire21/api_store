import { PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsNumber, IsString } from 'class-validator';

@Exclude()
export class UpdateProductDto {
  @Expose()
  @IsOptional()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  price: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  stock: number;

  @Expose()
  @IsOptional()
  @IsString()
  categoryId: string;
}
