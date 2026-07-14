import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateFeedbackDto, Feedback } from '@bus/models';
import { FeedbackService } from './app.service';
import { FeedbackImageService } from '../feedback-image/app.service';

import { AppService } from '../../../../users/src/app/app.service';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('feedback')
export class FeedbackController {
  constructor(
    public readonly service: FeedbackService,
    private readonly feedbackImageService: FeedbackImageService,
    private readonly userService: UserService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  async createWithImage(@Body() body: CreateFeedbackDto) {
    const { ImageUrl, ...feedbackDto } = body as any;

    const feedback = await this.service.create({
      ...feedbackDto,
      ImageUrls: Array.isArray(ImageUrl) ? ImageUrl : [],
    } as any as CreateFeedbackDto);

    if (!Array.isArray(ImageUrl) || ImageUrl.length === 0) {
      return { feedback };
    }

    const feedbackImages = await Promise.all(
      ImageUrl.map((imageUrl: string) =>
        this.feedbackImageService.create({
          FeedbackId: feedback._id,
          ImageUrl: imageUrl,
        }),
      ),
    );

    // --- 3. LOGIC GỬI THÔNG BÁO TỚI ADMIN ---
    try {
      // 3.1. Lấy tất cả token của Admin
      const adminTokens = await this.userService.getAdminTokens();

      // 3.2. Soạn nội dung thông báo
      const title = 'Có phản hồi/góp ý mới!';
      // Lấy đoạn đầu nội dung feedback làm body (nếu có trường Content/Name tùy schema của bạn)
      const content =
        (feedback as any).name || 'Vui lòng mở ứng dụng để xem chi tiết.';

      // 3.3. Bắn thông báo
      await this.firebaseService.sendNotificationToTokens(
        adminTokens,
        title,
        content,
      );
    } catch (error) {
      console.error('Lỗi quá trình lấy token hoặc gửi FCM:', error);
    }

    return {
      feedback,
      feedbackImages,
    };
  }

  @Get()
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: any,
  ) {
    return this.service.findAll({ page, limit, search });
  }

  @Get('categories')
  getFeedbackCategories() {
    return this.service.getFeedbackCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreateFeedbackDto>,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
