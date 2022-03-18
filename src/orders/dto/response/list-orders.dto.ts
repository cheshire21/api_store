import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Pagination } from '../../../common/dto/response/pagination.dto';
import { ClientOrderDto } from './client-order.dto';
import { ResponseOrderDto } from './order.dto';
@Exclude()
export class ListOrdersDto {
  @ApiProperty({ type: [ResponseOrderDto] })
  @Expose()
  orders: ResponseOrderDto[] | ClientOrderDto[];

  @ApiProperty()
  @Expose()
  pagination: Pagination;
}
