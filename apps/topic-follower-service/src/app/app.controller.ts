import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { SubscribeTopicDto } from '@bus/models';
import { InjectUserInterceptor } from '@bus/common';

@Controller('topic-followers')
@UseInterceptors(InjectUserInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. GET: Lấy danh sách ID các topic đã theo dõi
  @Get('my-subscriptions')
  async getMySubscriptions(@Req() req: any) {
    const userId = req.user.uid;
    return this.appService.getSubscribedTopicIds(userId);
  }

  // 2. POST: Đăng ký theo dõi
  @Post()
  async subscribe(@Req() req: any, @Body() dto: SubscribeTopicDto) {
    const userId = req.user.uid;
    return this.appService.subscribe(userId, dto);
  }

  // 3. DELETE: Hủy theo dõi
  @Delete(':topicId')
  async unsubscribe(@Req() req: any, @Param('topicId') topicId: string) {
    const userId = req.user.uid;
    return this.appService.unsubscribe(userId, topicId);
  }
}
