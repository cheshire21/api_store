import { Exclude, Expose } from 'class-transformer';
import { ResponseProductDto } from './product.dto';

@Exclude()
export class ListProductsDto {
  @Expose()
  products: ResponseProductDto[];

  @Expose()
  pagination: {
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}
