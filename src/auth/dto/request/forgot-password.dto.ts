import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { internet } from 'faker';

@Exclude()
export class ForgotPasswordDto {
  @ApiProperty({
    description: 'email',
    example: internet.email(),
  })
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
