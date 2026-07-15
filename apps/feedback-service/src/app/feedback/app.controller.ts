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
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  CreateFeedbackDto,
  FeedbackStatus,
  UpdateFeedbackDto,
} from '@bus/models';
import { FeedbackService } from './app.service';
import { FeedbackImageService } from '../feedback-image/app.service';
import { FirebaseService } from '@bus/common';

@Controller('feedback')
export class FeedbackController {
  constructor(
    public readonly service: FeedbackService,
    private readonly feedbackImageService: FeedbackImageService,
    private readonly httpService: HttpService,
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

    try {
      const response = await lastValueFrom(
        this.httpService.get(
          'https://users-ecsj.onrender.com/api/users/admin-tokens',
        ),
      );

      const adminTokens = response.data.tokens;

      if (adminTokens && adminTokens.length > 0) {
        await this.firebaseService.sendNotificationToTokens(
          adminTokens,
          'Có phản hồi mới từ ứng dụng!',
          `Phản hồi từ: ${feedbackDto.name || 'Người dùng'}. Vui lòng kiểm tra.`,
        );
      }
    } catch (error: any) {
      console.error('Lỗi khi gọi API users hoặc gửi FCM:', error.message);
    }

    return {
      feedback,
      feedbackImages,
    };
  }

  async create(@Body() body: CreateFeedbackDto) {
    return await this.service.createWithNotification(body);
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

  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() data: Partial<CreateFeedbackDto>,
  // ) {
  //   const updatedFeedback = await this.service.update(id, data);

  //   try {
  //     if (
  //       data.Status === FeedbackStatus.COMPLETED &&
  //       updatedFeedback.deviceToken
  //     ) {
  //       const title = 'Phản hồi đã được giải quyết ✅';
  //       const content =
  //         'Vấn đề bạn phản ánh đã được hệ thống xử lý hoàn tất. Cảm ơn sự đóng góp của bạn!';

  //       await this.firebaseService.sendNotificationToTokens(
  //         [updatedFeedback.deviceToken],
  //         title,
  //         content,
  //       );
  //     }
  //   } catch (error: any) {
  //     console.error('Lỗi khi gửi thông báo FCM cho User:', error.message);
  //   }

  //   return updatedFeedback;
  // }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateFeedbackDto) {
    return await this.service.updateWithNotification(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
