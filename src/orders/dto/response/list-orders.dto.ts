import { Pagination } from '../../../dto/response/pagination.dto';
import { ClientOrderDto } from './client-order.dto';
import { ResponseOrderDto } from './order.dto';

export class ListOrdersDto {
  orders: ResponseOrderDto[] | ClientOrderDto[];

  pagination: Pagination;
}
