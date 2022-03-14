import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { GetUser } from 'src/auth/get-user.decorator';
import { Roles } from 'src/auth/role/role.decorator';
import { PaginationOptionsDto } from 'src/dto/request/pagination-option.dto';
import { Role } from 'src/utils/enums';
import { ListOrdersDto } from './dto/response/list-orders.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @Roles(Role.manager, Role.client)
  @ApiResponse({
    status: 200,
    description: "gets a list of client's or clients' orders",
    type: ListOrdersDto,
  })
  @ApiBadRequestResponse({ description: 'Page is out of range' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  async getOrders(
    @GetUser() user: User,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
  ): Promise<ListOrdersDto> {
    const paginationOptionsDto = plainToInstance(PaginationOptionsDto, {
      take,
      page,
    });
    return await this.ordersService.getMany(user, paginationOptionsDto);
  }

  @Post()
  @Roles(Role.client)
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: "create a order with the cart's items",
  })
  @ApiBadRequestResponse({
    description: 'Quantity of some product is out of range',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  async createOrder(@GetUser() user: User): Promise<void> {
    return await this.ordersService.create(user.uuid);
  }
}
