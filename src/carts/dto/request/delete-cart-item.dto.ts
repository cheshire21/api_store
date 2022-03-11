import { OmitType } from '@nestjs/swagger';
import { CreateCartItem } from './create-cart-item.dto';

export class DeleteCartItemDto extends OmitType(CreateCartItem, [
  'quantity',
] as const) {}
