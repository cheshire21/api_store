import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@Exclude()
export class CreateProductDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  categoryId: string;
}
