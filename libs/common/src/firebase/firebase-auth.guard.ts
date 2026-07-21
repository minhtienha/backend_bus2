import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
<<<<<<< HEAD
import { getAuth } from 'firebase-admin/auth'; // 🚨 Thay đổi cách import ở đây
=======
import { getAuth } from 'firebase-admin/auth';
>>>>>>> d9b0b30 (update)

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
<<<<<<< HEAD
    // Sửa lại thành boolean cho đúng cú pháp TS
=======
>>>>>>> d9b0b30 (update)
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu token xác thực');
    }

    const token = authHeader.split(' ')[1];

    try {
<<<<<<< HEAD
      // 🚨 Dùng getAuth() trực tiếp thay vì admin.auth()
      const decodedToken = await getAuth().verifyIdToken(token);

      // Gán thông tin user vào request để Controller và Interceptor dùng được
=======
      const decodedToken = await getAuth().verifyIdToken(token);

>>>>>>> d9b0b30 (update)
      request.user = decodedToken;

      return true;
    } catch (error) {
      console.error('Lỗi xác thực Firebase Token:', error);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
