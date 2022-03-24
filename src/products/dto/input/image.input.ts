import { InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { ImageType } from 'src/common/enums';

@InputType()
export class ImageInput {
  @IsEnum(ImageType)
  type: ImageType;
}
