import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Resolver,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { GqlGetUser } from 'src/auth/decorators/gql-get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { GqlJwtGuard } from 'src/auth/guards/gql-jwt.guard';
import { GqlRolesGuard } from 'src/auth/guards/gql-role.guard';
import { PaginationOptionsInput } from 'src/common/dto/input/pagination-options.input';
import { Role } from 'src/common/enums';
import { ProductsService } from 'src/products/products.service';
import { Order } from '../models/order.model';
import { PaginatedOrder } from '../models/orders.model';
import { OrdersService } from '../orders.service';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private ordersService: OrdersService) {}

  @Mutation(() => Order)
  @Roles(Role.client)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async orderCreate(@GqlGetUser() user) {
    return await this.ordersService.create(user.uuid);
  }

  @Query(() => PaginatedOrder)
  @Roles(Role.client, Role.manager)
  @UseGuards(GqlJwtGuard, GqlRolesGuard)
  async orderGetMany(
    @GqlGetUser() user,
    @Args('paginationOptionsOrder')
    paginationOptionsOrder: PaginationOptionsInput,
  ) {
    const { orders, pagination } = await this.ordersService.getMany(
      user,
      paginationOptionsOrder,
    );

    const edges = orders.map((order) => {
      return {
        node: order,
      };
    });

    return {
      edges,
      pageInfo: pagination,
    };
  }
}
