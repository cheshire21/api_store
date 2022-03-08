import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/request/login.dto';
import { SignUpDto } from './dto/request/signup.dto';
import { Public } from './jwt/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Post('/signup')
  async signup(@Body() signUpDto: SignUpDto) {
    await this.authService.signup(signUpDto);
  }

  @Public()
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Public()
  @Get('/logout')
  async logout(@Query('token') token: string): Promise<void> {
    return this.authService.logout(token);
  }
}
