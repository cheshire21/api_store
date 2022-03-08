import { Controller, Get, Req } from '@nestjs/common';
import { Roles } from './auth/role/role.decorator';
import { Role } from './utils/enums';

@Controller()
export class AppController {
  @Get()
  @Roles(Role.admin, Role.user)
  getHello(@Req() req) {
    return 'Hello world';
  }
}
