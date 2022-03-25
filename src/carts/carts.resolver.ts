import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { GqlGetUser } from 'src/auth/decorators/gql-get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { GqlJwtGuard } from 'src/auth/guards/gql-jwt.guard';
import { GqlRolesGuard } from 'src/auth/guards/gql-role.guard';
import { Role } from 'src/common/enums';
import { CartsService } from './carts.service';
import { CartItemInput } from './dto/input/create-cart-item.input';
import { CartItem } from './models/cart-item.model';
import { Cart } from './models/cart.model';

@Resolver(() => Cart)
export class CartsResolver {
  constructor(private cartsService: CartsService) {}

  @Query(() => Cart)
  @Roles(Role.client)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async cartGet(@GqlGetUser() user) {
    return await this.cartsService.getItems(user.uuid);
  }

  @Mutation(() => CartItem)
  @Roles(Role.client)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async cartItemCreateorUpdate(
    @GqlGetUser() user,
    @Args('cartItemInput') cartItemInput: CartItemInput,
  ) {
    return await this.cartsService.upsertItem(user.uuid, cartItemInput);
  }
}