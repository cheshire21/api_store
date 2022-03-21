import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/request/login.dto';
import { SignUpDto } from './dto/request/sign-up.dto';
import { TokenDto } from './dto/response/token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiResponse({
    status: 201,
    description: 'created a account successfully',
    type: TokenDto,
  })
  @ApiBadRequestResponse({ description: 'Email already exists' })
  @ApiUnauthorizedResponse({ description: "Email doesn't exist " })
  @ApiInternalServerErrorResponse()
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @Post('/login')
  @ApiResponse({
    status: 201,
    description: 'login successfully',
    type: TokenDto,
  })
  @ApiUnauthorizedResponse({ description: "Email doesn't exist " })
  @ApiInternalServerErrorResponse()
  async login(@Body() loginDto: LoginDto): Promise<TokenDto> {
    return await this.authService.login(loginDto);
  }

  @Get('/logout')
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: 'log out successfully',
  })
  @ApiBadRequestResponse({ description: 'Token is invalid' })
  @ApiInternalServerErrorResponse()
  async logout(@Query('token') token: string): Promise<void> {
    return await this.authService.logout(token);
  }
}
