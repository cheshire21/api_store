import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType({
  description:
    'Status Input is a input type that capture status value to change status',
})
export class StatusInput {
  @Field({ description: 'status value' })
  @IsNotEmpty()
  status: boolean;
}
