import { Field, Float, ObjectType } from '@nestjs/graphql';
import { CartItem } from './cart-item.model';

@ObjectType()
export class Cart {
  @Field(() => Float)
  totalPrice: number;

  @Field()
  updatedAt: Date;

  @Field()
  createdAt: Date;

  @Field(() => [CartItem], { nullable: 'items' })
  items: CartItem[];
}
