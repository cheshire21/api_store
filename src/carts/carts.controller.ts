import { Body, Controller, Delete, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/get-user.decorator';
import { Roles } from 'src/auth/role/role.decorator';
import { Role } from 'src/utils/enums';
import { CartsService } from './carts.service';
import { CreateCartItem } from './dto/request/create-cart-item.dto';
import { DeleteCartItemDto } from './dto/request/delete-cart-item.dto';

@ApiTags('cart')
@Controller('cart')
export class CartsController {
  constructor(private cartsService: CartsService) {}

  @Patch()
  @Roles(Role.client)
  async createOrUpdate(
    @GetUser() user: User,
    @Body() createCartItem: CreateCartItem,
  ) {
    return await this.cartsService.upsertItem(user.uuid, createCartItem);
  }

  @Delete()
  @Roles(Role.client)
  async delete(
    @GetUser() user: User,
    @Body() deleteCartItemDto: DeleteCartItemDto,
  ) {
    const { productId } = deleteCartItemDto;
    return await this.cartsService.delete(user.uuid, productId);
  }
}
