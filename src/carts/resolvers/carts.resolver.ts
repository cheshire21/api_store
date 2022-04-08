import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { GqlGetUser } from 'src/auth/decorators/gql-get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { GqlJwtGuard } from 'src/auth/guards/gql-jwt.guard';
import { GqlRolesGuard } from 'src/auth/guards/gql-role.guard';
import { Message } from 'src/common/dto/input/message.model';
import { Role } from 'src/common/enums';
import { CartsService } from '../services/carts.service';
import { CartItemInput } from '../dto/input/create-cart-item.input';
import { CartItemDeleteInput } from '../dto/input/delete-item.input';
import { CartItem } from '../models/cart-item.model';
import { Cart } from '../models/cart.model';

@Resolver(() => Cart)
export class CartsResolver {
  constructor(private cartsService: CartsService) {}

  @Query(() => Cart, { description: 'query that return list of items' })
  @Roles(Role.client)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async cartGet(@GqlGetUser() user) {
    return await this.cartsService.getItems(user.uuid);
  }

  @Mutation(() => CartItem, {
    description: 'mutation that create or update a item in cart',
  })
  @Roles(Role.client)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async cartItemCreateorUpdate(
    @GqlGetUser() user,
    @Args('cartItemInput') cartItemInput: CartItemInput,
  ) {
    return await this.cartsService.upsertItem(user.uuid, cartItemInput);
  }

  @Mutation(() => Message, {
    description: 'mutation that delete a item in cart',
  })
  @Roles(Role.client)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async cartItemDelete(
    @GqlGetUser() user,
    @Args('cartItemDeleteInput') cartItemDeleteInput: CartItemDeleteInput,
  ) {
    const itemWasDeleted = await this.cartsService.delete(
      user.uuid,
      cartItemDeleteInput.productId,
    );

    if (itemWasDeleted) {
      return {
        message: 'Cart Item was Deleted',
        time: new Date(),
      };
    }
  }
}
