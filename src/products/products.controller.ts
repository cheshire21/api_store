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
  Delete,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Public } from 'src/auth/decorators/is-public.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/utils/enums';
import { CreateProductDto } from './dto/request/create-product.dto';
import { IdProductDto } from './dto/request/id-product.dto';
import { LikeDto } from './dto/request/like.dto';
import { PaginationOptionsProduct } from './dto/request/pag-product.dto';
import { StatusProductDto } from './dto/request/status-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { ListProductsDto } from './dto/response/list-products.dto';
import { ResponseProductImgDto } from './dto/response/product-img.dto';
import { ResponseProductDto } from './dto/response/product.dto';
import { LikesService } from '../likes/likes.service';
import { ProductsService } from './products.service';
import { ImageDto } from './dto/request/image.dto';
import { ResponseImageUrlDto } from './dto/response/image-url.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private likesService: LikesService,
  ) {}

  @Get()
  @Public()
  @ApiResponse({
    status: 200,
    description: 'return a list of product, search by category ',
    type: ListProductsDto,
  })
  @ApiBadRequestResponse({ description: 'page is out of range' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiQuery({
    name: 'take',
    description: 'quantity of items',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    description: 'page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'category',
    description: 'category of products',
    required: false,
    example: 'snack',
  })
  async getProducts(
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
    @Query('category', new DefaultValuePipe(null)) category,
  ): Promise<ListProductsDto> {
    const pagination = plainToInstance(PaginationOptionsProduct, {
      take,
      page,
      category,
    });

    return await this.productsService.getMany(pagination);
  }

  @Get('/:id')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'return a specific product details',
    type: ResponseProductDto,
  })
  @ApiNotFoundResponse({ description: "Product doesn't exist" })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async getProduct(
    @Param() idProductDto: IdProductDto,
  ): Promise<ResponseProductImgDto> {
    return await this.productsService.getOne(idProductDto.id);
  }

  @Post()
  @Roles(Role.manager)
  @ApiResponse({
    status: 201,
    description: 'create a product',
    type: ResponseProductDto,
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
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
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Product is disable ' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
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
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
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
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 200,
    description: 'upload a product image',
    type: ResponseImageUrlDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBearerAuth()
  async uploadImage(
    @Param('id') productId: string,
    @Body() imageDto: ImageDto,
  ) {
    return await this.productsService.uploadImage(productId, imageDto);
  }

  @Patch('/:id/like')
  @HttpCode(204)
  @Roles(Role.manager, Role.client)
  @ApiResponse({
    status: 204,
    description: 'user put like to a product',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  async upsetLike(
    @GetUser() user: User,
    @Param('id') productId: string,
    @Body() likeDto: LikeDto,
  ): Promise<void> {
    await this.likesService.upsertLike(user.uuid, productId, likeDto);
  }

  @Delete('/:id/like')
  @HttpCode(204)
  @Roles(Role.manager, Role.client)
  @ApiResponse({
    status: 204,
    description: 'user put dislike to a product',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  async deleteLike(
    @GetUser() user: User,
    @Param('id') productId: string,
  ): Promise<void> {
    await this.likesService.deleteLike(user.uuid, productId);
  }
}
