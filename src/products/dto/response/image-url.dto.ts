import { Exclude, Expose } from 'class-transformer';
import { ImageType } from '../../../common/enums';

@Exclude()
export class ResponseImageUrlDto {
  @Expose()
  productId: string;

  @Expose()
  type: ImageType;

  @Expose()
  url: string;
}
