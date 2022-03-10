import { Exclude, Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';

@Exclude()
export class LikeDto {
  @Expose()
  @IsBoolean()
  like: boolean;
}
