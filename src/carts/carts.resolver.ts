import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { GqlGetUser } from 'src/auth/decorators/gql-get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { GqlJwtGuard } from 'src/auth/guards/gql-jwt.guard';
import { GqlRolesGuard } from 'src/auth/guards/gql-role.guard';
import { Role } from 'src/common/enums';
import { CartsService } from './carts.service';
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
}
