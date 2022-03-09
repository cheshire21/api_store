import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { Roles } from 'src/auth/role/role.decorator';
import { Role } from 'src/utils/enums';

@Controller('products')
export class ProductsController {
  @Get()
  @Roles(Role.user, Role.admin)
  getProduct() {}

  @Post()
  @Roles(Role.admin)
  createProduct() {}

  @Patch('/:id')
  @Roles(Role.admin)
  updateProduct() {}

  @Roles(Role.admin)
  @Delete('/:id')
  deleteProduct() {}

  @Roles(Role.admin)
  @Delete('/:id/status')
  changeProductStatus() {}
}
