import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field({ description: 'client id' })
  uuid: string;

  @Field({ description: "client's first name" })
  firstName: string;

  @Field({ description: "client's last name" })
  lastName: string;

  @Field({ description: "client's user name" })
  userName: string;

  @Field({ description: "client's email" })
  email: string;
}
