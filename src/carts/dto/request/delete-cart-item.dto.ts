import { OmitType } from '@nestjs/swagger';
import { CreateCartItemDto } from './create-cart-item.dto';

export class DeleteCartItemDto extends OmitType(CreateCartItemDto, [
  'quantity',
] as const) {}
