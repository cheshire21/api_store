import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsNumber, IsPositive, IsString } from 'class-validator';

@Exclude()
export class CreateCartItem {
  @Expose()
  @IsString()
  productId: string;

  @Expose()
  @IsPositive()
  @IsInt()
  quantity: number;
}
