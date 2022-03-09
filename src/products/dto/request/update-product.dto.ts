import { PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

@Exclude()
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @Expose()
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
