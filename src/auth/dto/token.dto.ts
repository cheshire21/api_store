import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

@Exclude()
export class Token {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
