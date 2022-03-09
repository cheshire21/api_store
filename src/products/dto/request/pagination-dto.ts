import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

@Exclude()
export class PaginationOptionsProduct {
  @Expose()
  @IsOptional()
  @IsPositive()
  @IsNumber()
  page: number;

  @Expose()
  @IsOptional()
  @IsPositive()
  @IsNumber()
  take: number;

  @Expose()
  @IsOptional()
  @IsString()
  category: string;
}
