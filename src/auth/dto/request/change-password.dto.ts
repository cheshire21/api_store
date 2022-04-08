import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { internet } from 'faker';

@Exclude()
export class ChangePasswordDto {
  @ApiProperty({ description: 'token to verify user', example: 'TOKEN' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'new password', example: internet.password() })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;
}
