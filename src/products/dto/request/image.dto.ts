import { Exclude, Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ImageType } from '../../../common/enums';

@Exclude()
export class ImageDto {
  @Expose()
  @IsEnum(ImageType)
  type: ImageType;
}
