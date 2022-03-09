import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { query } from 'express';
import { Public } from 'src/auth/jwt/is-public.decorator';
import { Roles } from 'src/auth/role/role.decorator';
import { Role } from 'src/utils/enums';
import { CreateProductDto } from './dto/request/create-product.dto';
import { IdProductDto } from './dto/request/id-product.dto';
import { PaginationOptionsProduct } from './dto/request/pagination-dto';
import { StatusProductDto } from './dto/request/status-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @Public()
  getProducts(
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
    @Query('category', new DefaultValuePipe(null)) category,
  ) {
    let pagination = plainToInstance(PaginationOptionsProduct, {
      take,
      page,
      category,
    });

    return this.productsService.getMany(pagination);
  }

  @Get('/:id')
  @Roles(Role.client, Role.manager)
  getProduct(@Param() idProductDto: IdProductDto) {
    return this.productsService.getOne(idProductDto.id);
  }

  @Post()
  @Roles(Role.manager)
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch('/:id')
  @Roles(Role.manager)
  updateProduct(
    @Param() idProductDto: IdProductDto,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(idProductDto.id, updateProductDto);
  }

  @Roles(Role.manager)
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
  @Roles(Role.manager)
  @Patch('/:id/image')
  uploadImage() {}
}
