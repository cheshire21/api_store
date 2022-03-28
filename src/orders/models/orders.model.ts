import { ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/common/models/IPagination.model';
import { Order } from './order.model';

@ObjectType()
export class PaginatedOrder extends Paginated(Order) {}
