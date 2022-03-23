import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { address, internet, name } from 'faker';
import { Role } from '../../../common/enums';

@Exclude()
export class SignUpDto {
  @ApiProperty({
    example: name.firstName(),
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: name.lastName(),
  })
  @Expose()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: address.direction(),
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    example: internet.userName(),
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({
    example: internet.email(),
  })
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: internet.password(),
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
