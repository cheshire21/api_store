import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { InfoUserDto } from './info-user.dto';
import { ResponseOrderDto } from './order.dto';

export class ClientOrderDto extends PartialType(ResponseOrderDto) {
  @Expose()
  user: InfoUserDto;
}
