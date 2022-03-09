import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

@Exclude()
export class IdProductDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  id: string;
}
