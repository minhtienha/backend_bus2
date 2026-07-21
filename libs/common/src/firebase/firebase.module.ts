import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import { FirebaseService } from './firebase.service';

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const rawPrivateKey = configService.get<string>('FIREBASE_PRIVATE_KEY');

    const privateKey = rawPrivateKey
      ?.replace(/^"|"$/g, '')
      ?.replace(/^'|'$/g, '')
      ?.replace(/\\n/g, '\n');

    console.log('--- TEST PRIVATE KEY ---');
    console.log(
      privateKey?.substring(0, 30) + '..........' + privateKey?.slice(-30),
    );
    console.log('------------------------');

    const firebaseConfig = {
      type: configService.get<string>('FIREBASE_TYPE'),
      project_id: configService.get<string>('FIREBASE_PROJECT_ID'),
      private_key_id: configService.get<string>('FIREBASE_PRIVATE_KEY_ID'),
      private_key: privateKey,
      client_email: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      client_id: configService.get<string>('FIREBASE_CLIENT_ID'),
      auth_uri: configService.get<string>('FIREBASE_AUTH_URI'),
      token_uri: configService.get<string>('FIREBASE_TOKEN_URI'),
      auth_provider_x509_cert_url: configService.get<string>(
        'FIREBASE_AUTH_CERT_URL',
      ),
      client_x509_cert_url: configService.get<string>(
        'FIREBASE_CLIENT_CERT_URL',
      ),
      universe_domain: configService.get<string>('FIREBASE_UNIVERSAL_DOMAIN'),
    };

    // Khởi tạo Firebase Admin App
    return admin.initializeApp({
      credential: cert(firebaseConfig as admin.ServiceAccount),
      databaseURL: `https://${firebaseConfig.project_id}.firebaseio.com`,
      storageBucket: `${firebaseConfig.project_id}.appspot.com`,
    });
  },
};

@Module({
  imports: [ConfigModule], // Đảm bảo ConfigModule đã được import
  providers: [firebaseProvider, FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
