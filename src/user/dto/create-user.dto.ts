import { OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { SignUpDto } from '../../auth/dto/request/signup.dto';

@Exclude()
export class CreateUserDto extends OmitType(SignUpDto, [
  'passwordConfirmation',
] as const) {}
