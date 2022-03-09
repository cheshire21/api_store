import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/auth/role/role.decorator';
import { Role } from 'src/utils/enums';
import { CreateProductDto } from './dto/request/create-product.dto';
import { IdProductDto } from './dto/request/id-product.dto';
import { StatusProductDto } from './dto/request/status-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}
  @Get('/:id')
  @Roles(Role.user, Role.admin)
  getProduct(@Param() idProductDto: IdProductDto) {
    return this.productsService.getOne(idProductDto.id);
  }

  @Post()
  @Roles(Role.admin)
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch('/:id')
  @Roles(Role.admin)
  updateProduct(
    @Param() idProductDto: IdProductDto,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(idProductDto.id, updateProductDto);
  }

  @Roles(Role.admin)
  @Patch('/:id/status')
  changeProductStatus(
    @Param() idProductDto: IdProductDto,
    @Body() statusProductDto: StatusProductDto,
  ) {
    return this.productsService.changeStatus(
      idProductDto.id,
      statusProductDto.status,
    );
  }
}
