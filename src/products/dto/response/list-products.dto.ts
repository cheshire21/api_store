import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Pagination } from '../../../dto/response/pagination.dto';
import { ResponseProductDto } from './product.dto';

@Exclude()
export class ListProductsDto {
  @ApiProperty({
    type: [ResponseProductDto],
  })
  @Expose()
  products: ResponseProductDto[];

  @ApiProperty({
    example: Pagination,
  })
  @Expose()
  pagination: Pagination;
}
