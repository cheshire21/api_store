import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';
import { GqlGetUser } from 'src/auth/decorators/gql-get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { GqlJwtGuard } from 'src/auth/guards/gql-jwt.guard';
import { GqlRolesGuard } from 'src/auth/guards/gql-role.guard';
import { Role } from 'src/common/enums';
import { ProductsService } from 'src/products/products.service';
import { Order } from './models/order.model';
import { OrdersService } from './orders.service';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private ordersService: OrdersService) {}

  @Mutation(() => Order)
  @Roles(Role.client)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async orderCreate(@GqlGetUser() user) {
    return await this.ordersService.create(user.uuid);
  }
}
