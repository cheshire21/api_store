import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { GetUser } from 'src/auth/get-user.decorator';
import { Roles } from 'src/auth/role/role.decorator';
import { PaginationOptionsDto } from 'src/dto/request/pagination-option.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'src/utils/enums';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @Roles(Role.manager, Role.client)
  async getOrders(
    @GetUser() user: User,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
  ) {
    console.log(user);
    const paginationOptionsDto = plainToInstance(PaginationOptionsDto, {
      take,
      page,
    });
    return await this.ordersService.getMany(user, paginationOptionsDto);
  }

  @Post()
  @Roles(Role.client)
  async createOrder(@GetUser() user: User) {
    return await this.ordersService.create(user.uuid);
  }
}
