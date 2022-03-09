import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

@Exclude()
export class StatusProductDto {
  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
