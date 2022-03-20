import { PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ResponseProductDto } from './product.dto';

@Exclude()
export class ResponseProductImgDto extends PartialType(ResponseProductDto) {
  @Expose()
  images: string[];
}
