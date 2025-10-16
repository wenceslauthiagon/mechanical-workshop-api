import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
  @Get('favicon.ico')
  getFavicon(@Res() res: Response): void {
    res.status(204).end();
  }
}
