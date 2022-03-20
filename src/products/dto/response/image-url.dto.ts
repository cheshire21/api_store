import { Exclude, Expose } from 'class-transformer';
import { ImageType } from '../../../utils/enums';

@Exclude()
export class ResponseImageUrlDto {
  @Expose()
  productId: string;

  @Expose()
  type: ImageType;

  @Expose()
  url: string;
}
