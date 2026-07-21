import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
<<<<<<< HEAD
  UseGuards, // Thêm UseGuards
  UseInterceptors,
  UnauthorizedException, // Thêm để quăng lỗi 401 nếu không có user
=======
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
>>>>>>> d9b0b30 (update)
} from '@nestjs/common';
import { AppService } from './app.service';
import { SubscribeTopicDto } from '@bus/models';
import { InjectUserInterceptor } from '@bus/common';
<<<<<<< HEAD
// Sửa lại đường dẫn import Guard cho đúng với cấu trúc dự án của Tiến
import { FirebaseAuthGuard } from '@bus/common';

@Controller('topic-followers')
@UseGuards(FirebaseAuthGuard) // 🚨 QUAN TRỌNG: Phải gắn Guard này vào để nó giải mã Token
=======
import { FirebaseAuthGuard } from '@bus/common';

@Controller('topic-followers')
@UseGuards(FirebaseAuthGuard)
>>>>>>> d9b0b30 (update)
@UseInterceptors(InjectUserInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. GET: Lấy danh sách ID các topic đã theo dõi
  @Get('my-subscriptions')
  async getMySubscriptions(@Req() req: any) {
<<<<<<< HEAD
    // Thêm dấu ? để chống crash lỗi 500. Fallback giữa user_id và uid
=======
>>>>>>> d9b0b30 (update)
    const userId = req.user?.user_id || req.user?.uid;

    if (!userId)
      throw new UnauthorizedException('Không tìm thấy thông tin User');
    return this.appService.getSubscribedTopicIds(userId);
  }

  // 2. POST: Đăng ký theo dõi
  @Post()
  async subscribe(@Req() req: any, @Body() dto: SubscribeTopicDto) {
    const userId = req.user?.user_id || req.user?.uid;

    if (!userId)
      throw new UnauthorizedException('Không tìm thấy thông tin User');
    return this.appService.subscribe(userId, dto);
  }

  // 3. DELETE: Hủy theo dõi
  @Delete(':topicId')
  async unsubscribe(@Req() req: any, @Param('topicId') topicId: string) {
    const userId = req.user?.user_id || req.user?.uid;

    if (!userId)
      throw new UnauthorizedException('Không tìm thấy thông tin User');
    return this.appService.unsubscribe(userId, topicId);
  }
}
