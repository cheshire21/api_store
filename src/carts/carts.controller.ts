import { Body, Controller, Delete, Get, HttpCode, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/get-user.decorator';
import { Roles } from 'src/auth/role/role.decorator';
import { Role } from 'src/utils/enums';
import { CartsService } from './carts.service';
import { CreateCartItemDto } from './dto/request/create-cart-item.dto';
import { DeleteCartItemDto } from './dto/request/delete-cart-item.dto';
import { CartItemsDto } from './dto/response/cart-items.dto';
import { ResponseCartDto } from './dto/response/response-cart-item.dto';

@ApiTags('cart')
@Controller('cart')
export class CartsController {
  constructor(private cartsService: CartsService) {}

  @Get()
  @Roles(Role.client)
  @ApiResponse({
    status: 200,
    description: 'get all items on the cart',
  })
  @ApiBearerAuth()
  async getItems(@GetUser() user: User): Promise<CartItemsDto> {
    return await this.cartsService.getItems(user.uuid);
  }

  @Patch()
  @Roles(Role.client)
  @ApiResponse({
    status: 200,
    description: "create or update a cart't item",
    type: ResponseCartDto,
  })
  @ApiBearerAuth()
  async createOrUpdate(
    @GetUser() user: User,
    @Body() createCartItem: CreateCartItemDto,
  ): Promise<ResponseCartDto> {
    return await this.cartsService.upsertItem(user.uuid, createCartItem);
  }

  @Delete()
  @Roles(Role.client)
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: "delete a cart't item",
  })
  @ApiBearerAuth()
  async delete(
    @GetUser() user: User,
    @Body() deleteCartItemDto: DeleteCartItemDto,
  ): Promise<void> {
    const { productId } = deleteCartItemDto;
    return await this.cartsService.delete(user.uuid, productId);
  }
}
