import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';

import serviceAccount from './serviceAccountKey.json';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount as admin.ServiceAccount),
      });
    }
  }

  get auth() {
    return getAuth();
  }

  get messaging() {
    return getMessaging();
  }

  async sendNotificationToTokens(
    tokens: string[],
    title: string,
    body: string,
  ) {
    if (!tokens || tokens.length === 0) {
      console.log('Không có token nào để gửi thông báo.');
      return;
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      tokens: tokens, // Mảng các fcmToken nhận được từ UserService
    };

    try {
      // Dùng sendEachForMulticast (Hàm chuẩn của SDK mới)
      const response = await getMessaging().sendEachForMulticast(message);
      console.log(`Đã gửi thành công ${response.successCount} thông báo.`);

      // (Nâng cao) Bạn có thể log ra những token bị lỗi ở đây để dọn dẹp Database
    } catch (error) {
      console.error('Lỗi khi gửi thông báo FCM:', error);
    }
  }
}
