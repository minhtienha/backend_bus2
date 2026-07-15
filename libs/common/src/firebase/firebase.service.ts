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

  // Tạo một getter để lấy messaging instance an toàn
  get messaging() {
    return getMessaging();
  }

  async sendNotificationToTokens(
    tokens: string[],
    title: string,
    body: string,
  ) {
    if (!tokens || tokens.length === 0) {
      return;
    }

    const messages = tokens.map((token) => ({
      token: token,
      notification: { title, body },
    }));

    try {
      await this.messaging.sendEach(messages);
      console.log(`Đã gửi FCM thành công thiết bị.`);
    } catch (error) {
      console.error('Lỗi khi gửi thông báo FCM:', error);
    }
  }
}
