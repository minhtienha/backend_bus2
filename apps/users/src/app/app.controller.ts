import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('users')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('sync-token')
  async syncToken(
    @Body()
    body: {
      uid: string;
      email: string;
      name: string;
      fcmToken: string;
    },
  ) {
    return this.appService.syncUserAndToken(
      body.uid,
      body.email,
      body.name,
      body.fcmToken,
    );
  }
}
