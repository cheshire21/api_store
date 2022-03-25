import { Exclude, Expose } from 'class-transformer';
import { ImageType } from '../../../common/enums';

@Exclude()
export class ImageDto {
  @Expose()
  uuid: string;

  @Expose()
  url: string;

  @Expose()
  type: ImageType;

  @Exclude()
  productId: string;
}
