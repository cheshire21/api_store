import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType({
  description:
    'Like Input is input type that capture user like to create or update like',
})
export class LikeInput {
  @Field()
  @IsNotEmpty()
  like: boolean;
}
