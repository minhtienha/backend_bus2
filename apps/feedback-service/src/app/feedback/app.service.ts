import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateFeedbackDto,
  Feedback,
  FeedbackStatus,
  type FeedbackDocument,
} from '@bus/models';
import { FirebaseService } from '@bus/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

export enum FeedbackCategory {
  SERVICE_QUALITY = 'SERVICE_QUALITY',
  COMMENDATION = 'COMMENDATION',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  ROUTE_AND_SCHEDULE = 'ROUTE_AND_SCHEDULE',
  OTHER = 'OTHER',
}

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly model: Model<FeedbackDocument>,
    private readonly httpService: HttpService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async create(data: CreateFeedbackDto) {
    const feedback = new this.model(data);
    return (await feedback.save()).toObject();
  }

  async createWithNotification(dto: any) {
    // 1. Tạo Feedback lưu vào Database
    const feedback = await this.model.create(dto);

    // ==========================================
    // 2. GỬI THÔNG BÁO CHO ADMIN (Báo có việc mới)
    // ==========================================
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          'https://users-ecsj.onrender.com/api/users/admin-tokens',
        ),
      );
      const adminTokens = response.data?.tokens;

      if (adminTokens && adminTokens.length > 0) {
        // Tạo mảng tin nhắn gửi cho từng admin
        const adminMessages = adminTokens.map((token: string) => ({
          token: token,
          notification: {
            title: 'Có phản hồi mới! 🚨',
            body: `Phản hồi từ: ${dto.FullName || 'Một người dùng ẩn danh'}. Vui lòng kiểm tra.`,
          },
          data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            type: 'NEW_FEEDBACK',
            feedbackId: feedback._id.toString(),
          },
        }));

        // Bắn thông báo đi
        await this.firebaseService.messaging.sendEach(adminMessages);
        console.log('[FCM] Đã báo cho Admin về phản hồi mới.');
      }
    } catch (e: any) {
      console.error('Lỗi khi lấy token hoặc gửi thông báo Admin:', e.message);
    }

    // ==========================================
    // 3. GỬI THÔNG BÁO CHO NGƯỜI GỬI (Biên lai xác nhận - Tùy chọn)
    // ==========================================
    if (dto.deviceToken) {
      try {
        const userMessages = [
          {
            token: dto.deviceToken,
            notification: {
              title: 'Đã tiếp nhận phản hồi ✅',
              body: 'Cảm ơn bạn đã đóng góp ý kiến. Ban quản lý sẽ xem xét và xử lý trong thời gian sớm nhất!',
            },
            data: {
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
              type: 'FEEDBACK_RECEIVED',
              feedbackId: feedback._id.toString(),
            },
          },
        ];

        await this.firebaseService.messaging.sendEach(userMessages);
        console.log(`[FCM] Đã gửi thông báo cảm ơn đến thiết bị người dùng.`);
      } catch (error: any) {
        console.error('Lỗi khi gửi thông báo cảm ơn cho User:', error.message);
      }
    }

    return feedback;
  }

  async findAll({ page = 1, limit = 10, search = '' }: FindAllParams = {}) {
    const skip = (page - 1) * limit;
    const query = search
      ? {
          name: { $regex: search as string, $options: 'i' },
        }
      : {};

    const feedbacks = await this.model.find(query).skip(skip).limit(+limit);

    if (!feedbacks.length) {
      throw new HttpException('Không tìm thấy phản ảnh/góp ý nào', 404);
    }

    const total = await this.model.countDocuments(query);

    return {
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  getFeedbackCategories() {
    return Object.values(FeedbackCategory).map((value) => ({
      value: value,
      ...this.getCategoryDetails(value),
    }));
  }

  private getCategoryDetails(category: FeedbackCategory): {
    label: string;
    icon: string;
  } {
    const baseUrl = 'https://feedback-service-93if.onrender.com';

    const categoryConfig: Record<
      FeedbackCategory,
      { label: string; icon: string }
    > = {
      [FeedbackCategory.SERVICE_QUALITY]: {
        label: 'Chất lượng dịch vụ, vi phạm',
        icon: `${baseUrl}/public/icons/ic_service_quality.png`,
      },
      [FeedbackCategory.COMMENDATION]: {
        label: 'Người tốt, việc tốt, khen thưởng',
        icon: `${baseUrl}/public/icons/ic_commendation.png`,
      },
      [FeedbackCategory.INFRASTRUCTURE]: {
        label: 'Cơ sở hạ tầng, trạm xe buýt',
        icon: `${baseUrl}/public/icons/ic_infrastructure.png`,
      },
      [FeedbackCategory.ROUTE_AND_SCHEDULE]: {
        label: 'Tuyến xe, thời gian hoạt động',
        icon: `${baseUrl}/public/icons/ic_route_schedule.png`,
      },
      [FeedbackCategory.OTHER]: {
        label: 'Khác',
        icon: `${baseUrl}/public/icons/ic_other.png`,
      },
    };

    return (
      categoryConfig[category] || {
        label: category,
        icon: `${baseUrl}/public/icons/ic_default.png`,
      }
    );
  }

  async findOne(id: string) {
    const feedback = await this.model.findById(id).exec();
    if (!feedback) {
      throw new HttpException('Feedback không tồn tại', HttpStatus.NOT_FOUND);
    }
    return feedback.toObject();
  }

  async update(id: string, data: Partial<CreateFeedbackDto>) {
    const feedback = await this.model
      .findByIdAndUpdate(id, data, { returnDocument: 'after' })
      .exec();
    if (!feedback) {
      throw new HttpException('Feedback không tồn tại', HttpStatus.NOT_FOUND);
    }
    return feedback.toObject();
  }

  async updateWithNotification(id: string, data: any) {
    const updated = await this.model.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (data.Status && updated?.deviceToken) {
      try {
        const title = data.notificationTitle;
        const content = data.notificationContent;

        const rawPayload = data.payload || {};
        const safePayload: Record<string, string> = {};

        for (const key in rawPayload) {
          safePayload[key] = String(rawPayload[key]);
        }

        const customData = {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          type: 'FEEDBACK_UPDATE',
          feedbackId: updated._id.toString(),
          status: String(updated.Status),
          ...safePayload,
        };

        const messages = [
          {
            token: updated.deviceToken,
            notification: { title, body: content },
            data: customData,
          },
        ];

        await this.firebaseService.messaging.sendEach(messages);
        console.log(`[FCM] Đã bắn thông báo động theo status: ${data.Status}`);
      } catch (e: any) {
        console.error('Lỗi khi gửi thông báo FCM cho User:', e.message);
      }
    }
    return updated;
  }

  async delete(id: string) {
    const feedback = await this.model.findByIdAndDelete(id).exec();
    if (!feedback) {
      throw new HttpException('Feedback không tồn tại', HttpStatus.NOT_FOUND);
    }
    return { message: 'Feedback đã được xóa thành công' };
  }
}
