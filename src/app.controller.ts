import { Controller, Get, Req } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(@Req() req) {
    console.log(req.user);
    return 'Hello world';
  }
}
