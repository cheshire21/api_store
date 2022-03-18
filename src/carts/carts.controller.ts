import { Body, Controller, Delete, Get, HttpCode, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
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
    type: CartItemsDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
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
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Product is in disable status' })
  @ApiUnauthorizedResponse({ description: 'Quantity is bigger than stock' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
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
    description: "delete a cart's item",
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  async delete(
    @GetUser() user: User,
    @Body() deleteCartItemDto: DeleteCartItemDto,
  ): Promise<void> {
    const { productId } = deleteCartItemDto;
    return await this.cartsService.delete(user.uuid, productId);
  }
}
