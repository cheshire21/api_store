import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { internet } from 'faker';

@Exclude()
export class ChangePasswordDto {
  @ApiProperty({
    description: 'token that was sent by email',
  })
  @Expose()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'new password' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;
}
