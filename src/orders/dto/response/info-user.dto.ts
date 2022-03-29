import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { datatype, internet, name } from 'faker';

@Exclude()
export class InfoUserDto {
  @ApiProperty({
    example: datatype.uuid(),
  })
  @Expose()
  uuid: string;

  @ApiProperty({
    example: name.firstName(),
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    example: name.lastName(),
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    example: internet.userName(),
  })
  @Expose()
  userName: string;

  @ApiProperty({
    example: internet.email(),
  })
  @Expose()
  email: string;
}
