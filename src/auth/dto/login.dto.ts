import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

@Exclude()
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;
}
