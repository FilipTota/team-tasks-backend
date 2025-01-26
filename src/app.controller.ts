import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './guards/auth.guard';

// Applying guard (that we created in auth.guard.ts) on top of this Controller
@UseGuards(AuthGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  someProtectedRoute(@Req() req) {
    return {
      message: 'Accessed Resource',
      userId: req.userId,
    };
  }
}
