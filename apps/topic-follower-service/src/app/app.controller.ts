import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SubscribeTopicDto } from '@bus/models';

@Controller('topic-followers')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(@Body() dto: SubscribeTopicDto) {
    return await this.appService.subscribe(dto);
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  async unsubscribe(@Body() dto: SubscribeTopicDto) {
    return await this.appService.unsubscribe(dto);
  }
}
