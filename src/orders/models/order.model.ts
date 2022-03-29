import { ObjectType, Field, Float } from '@nestjs/graphql';
import { User } from 'src/users/models/client.model';
import { OrderItem } from './order-item.model';

@ObjectType()
export class Order {
  @Field()
  uuid: string;

  @Field()
  client: User;

  @Field(() => Float)
  totalPrice: number;

  @Field()
  updatedAt: Date;

  @Field()
  createdAt: Date;

  @Field(() => [OrderItem], { nullable: 'items' })
  items: OrderItem[];
}
