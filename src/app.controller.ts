import { Controller, Get, Req } from '@nestjs/common';
import { Roles } from './auth/decorators/role.decorator';
import { Role } from './utils/enums';

@Controller()
export class AppController {
  @Get()
  @Roles(Role.manager, Role.client)
  getHello(@Req() req) {
    return 'Hello world';
  }
}
