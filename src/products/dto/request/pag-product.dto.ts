import { PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationOptionsDto } from '../../../common/dto/request/pagination-option.dto';

@Exclude()
export class PaginationOptionsProduct extends PartialType(
  PaginationOptionsDto,
) {
  @Expose()
  @IsOptional()
  @IsString()
  category: string;
}
