import { Field, InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { ImageType } from 'src/common/enums';

@InputType({ description: 'Image Input is input type to capture image type' })
export class ImageInput {
  @Field({ description: 'define the image format' })
  @IsEnum(ImageType)
  type: ImageType;
}
