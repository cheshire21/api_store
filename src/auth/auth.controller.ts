import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { ChangePasswordDto } from './dto/request/change-password.dto';
import { ForgotPasswordDto } from './dto/request/forgot-password.dto';
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

  @Post('/forgot-password')
  @HttpCode(204)
  async forgotPassword(@Body() data: ForgotPasswordDto) {
    await this.authService.sendEmailChangePassword(data);
  }

  @Post('/reset-password')
  async resetPassword(@Body() data: ChangePasswordDto) {
    await this.authService.resetPassword(data);
  }
}
