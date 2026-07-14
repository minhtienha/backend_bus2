import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async sendNotificationToTokens(
    tokens: string[],
    title: string,
    body: string,
  ) {
    if (!tokens || tokens.length === 0) {
      return;
    }

    const message = {
      notification: { title, body },
      tokens: tokens,
    };

    try {
      const response = await getMessaging().sendEachForMulticast(message);
      console.log(`Đã gửi FCM thành công: ${response.successCount} thiết bị.`);
    } catch (error) {
      console.error('Lỗi khi gửi thông báo FCM:', error);
    }
  }
}
