import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { Public } from './jwt/is-public.decorator';

@Controller('auth')
export class AuthController {
  @Public()
  @HttpCode(204)
  @Post('/signup')
  signup(@Body() body) {}

  @Public()
  @Post('/login')
  login(@Body() body) {}

  @Get('/logout')
  logout(@Query('token') token: string) {}
}
