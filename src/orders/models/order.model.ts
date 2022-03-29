import { ObjectType, Field, Float } from '@nestjs/graphql';
import { User } from 'src/users/models/client.model';
import { OrderItem } from './order-item.model';

@ObjectType()
export class Order {
  @Field({ description: 'Order id' })
  uuid: string;

  @Field({ nullable: true })
  client: User;

  @Field(() => Float)
  totalPrice: number;

  @Field({ description: "Order's updated date" })
  updatedAt: Date;

  @Field({ description: "Order's created date" })
  createdAt: Date;

  @Field(() => [OrderItem], { nullable: 'items', description: "Order's items" })
  items: OrderItem[];
}
