import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Public } from 'src/auth/jwt/is-public.decorator';
import { Roles } from 'src/auth/role/role.decorator';
import { Role } from 'src/utils/enums';
import { CreateProductDto } from './dto/request/create-product.dto';
import { IdProductDto } from './dto/request/id-product.dto';
import { PaginationOptionsProduct } from './dto/request/pag-product.dto';
import { StatusProductDto } from './dto/request/status-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { ListProductsDto } from './dto/response/list-products.dto';
import { ResponseProductDto } from './dto/response/product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiResponse({
    status: 200,
    description: 'return a list of product, search by category ',
    type: ListProductsDto,
  })
  async getProducts(
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
    @Query('category', new DefaultValuePipe(null)) category,
  ): Promise<ListProductsDto> {
    let pagination = plainToInstance(PaginationOptionsProduct, {
      take,
      page,
      category,
    });

    return await this.productsService.getMany(pagination);
  }

  @Get('/:id')
  @Roles(Role.client, Role.manager)
  @ApiResponse({
    status: 200,
    description: 'return a specific product details',
    type: ResponseProductDto,
  })
  async getProduct(
    @Param() idProductDto: IdProductDto,
  ): Promise<ResponseProductDto> {
    return await this.productsService.getOne(idProductDto.id);
  }

  @Post()
  @Roles(Role.manager)
  @ApiResponse({
    status: 201,
    description: 'create a product',
    type: ResponseProductDto,
  })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ResponseProductDto> {
    return await this.productsService.create(createProductDto);
  }

  @Patch('/:id')
  @Roles(Role.manager)
  @ApiResponse({
    status: 200,
    description: 'update a product',
    type: ResponseProductDto,
  })
  updateProduct(
    @Param() idProductDto: IdProductDto,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(idProductDto.id, updateProductDto);
  }

  @Roles(Role.manager)
  @Patch('/:id/status')
  @ApiResponse({
    status: 200,
    description: 'change product status',
    type: ResponseProductDto,
  })
  changeProductStatus(
    @Param() idProductDto: IdProductDto,
    @Body() statusProductDto: StatusProductDto,
  ) {
    return this.productsService.changeStatus(
      idProductDto.id,
      statusProductDto.status,
    );
  }

  @Patch('/:id/image')
  @Roles(Role.manager)
  @ApiResponse({
    status: 200,
    description: 'upload a product image',
    type: ResponseProductDto,
  })
  uploadImage() {}
}
