import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InfoUserDto {
  @Expose()
  uuid: string;
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
}
