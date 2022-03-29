import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'Message is a object type that is used to send a message about created updated or deleted like or deleted cart item',
})
export class Message {
  @Field({ description: 'message content' })
  message: string;
  @Field({ description: 'datetime of current action' })
  time: Date;
}
