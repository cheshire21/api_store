import { ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/common/models/IPagination.model';
import { Product } from './product.model';

@ObjectType()
export class PaginatedProduct extends Paginated(Product) {}
