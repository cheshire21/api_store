import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ImageDto {
  @Expose()
  uuid: string;

  @Expose()
  url: string;
}
