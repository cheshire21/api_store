import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Pagination } from '../../../common/dto/response/pagination.dto';
import { ResponseProductImgDto } from './product-img.dto';

@Exclude()
export class ListProductsDto {
  @ApiProperty({
    type: [ResponseProductImgDto],
  })
  @Expose()
  products: ResponseProductImgDto[];

  @ApiProperty({
    example: Pagination,
  })
  @Expose()
  pagination: Pagination;
}
