import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

@Exclude()
export class TokenDto {
  @Expose()
  accessToken: string;
}
