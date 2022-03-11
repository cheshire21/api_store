import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/request/login.dto';
import { SignUpDto } from './dto/request/signup.dto';
import { TokenDto } from './dto/response/token.dto';
import { Public } from './jwt/is-public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup')
  @ApiResponse({
    status: 201,
    description: 'created a account successfully',
  })
  async signup(@Body() signUpDto: SignUpDto) {
    await this.authService.signup(signUpDto);
  }

  @Public()
  @Post('/login')
  @ApiResponse({
    status: 201,
    description: 'login successfully',
    type: TokenDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenDto> {
    return await this.authService.login(loginDto);
  }
  @Public()
  @Get('/logout')
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: 'log out successfully',
  })
  async logout(@Query('token') token: string): Promise<void> {
    return await this.authService.logout(token);
  }
}
