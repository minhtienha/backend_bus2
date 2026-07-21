import { Inject, Injectable, Logger } from '@nestjs/common';
import { getMessaging } from 'firebase-admin/messaging';
import type { App } from 'firebase-admin/app';

@Injectable()
export class FirebaseService {
  // Khởi tạo Logger chuẩn của NestJS thay vì dùng console.log thuần
  private readonly logger = new Logger(FirebaseService.name);

  constructor(@Inject('FIREBASE_APP') private firebaseApp: App) {}

  get messaging() {
    // Truyền instance firebaseApp vào để chắc chắn dùng đúng config đã inject
    return getMessaging(this.firebaseApp);
  }

  async sendNotificationToTokens(
    tokens: string[],
    title: string,
    body: string,
  ) {
    if (!tokens || tokens.length === 0) {
      this.logger.warn('Không có token nào được cung cấp để gửi thông báo.');
      return;
    }

    // Map mảng tokens thành định dạng messages
    const messages = tokens.map((token) => ({
      token: token,
      notification: { title, body },
    }));

    try {
      // Gửi hàng loạt thông báo
      const response = await this.messaging.sendEach(messages);

      this.logger.log(
        `Gửi FCM thành công: ${response.successCount} thiết bị, Thất bại: ${response.failureCount} thiết bị.`,
      );

      // (Tùy chọn) Ghi log chi tiết nếu có token bị lỗi (ví dụ: token hết hạn)
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        this.logger.warn(`Các token bị lỗi: ${failedTokens.join(', ')}`);
      }
    } catch (error) {
      this.logger.error('Lỗi nghiêm trọng khi gửi thông báo FCM:', error);
      throw error; // Ném lỗi ra ngoài để Global Exception Filter của NestJS xử lý nếu cần
    }
  }
}
