import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { InfoUserDto } from './info-user.dto';
import { ResponseOrderDto } from './order.dto';
@Exclude()
export class ClientOrderDto extends PartialType(ResponseOrderDto) {
  @ApiProperty()
  @Expose()
  user: InfoUserDto;
}
