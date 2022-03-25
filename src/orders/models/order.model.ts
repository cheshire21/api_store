import { ObjectType, Field, Float } from '@nestjs/graphql';
import { OrderItem } from './order-item.model';

@ObjectType()
export class Order {
  @Field(() => Float)
  totalPrice: number;

  @Field()
  updatedAt: Date;

  @Field()
  createdAt: Date;

  @Field(() => [OrderItem], { nullable: 'items' })
  items: OrderItem[];
}
