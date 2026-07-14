import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@bus/models';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async syncUserAndToken(
    uid: string,
    email: string,
    name: string,
    fcmToken: string,
  ) {
    const user = await this.userModel.findOne({ uid });

    if (user) {
      if (fcmToken && !user.fcmTokens?.includes(fcmToken)) {
        user.fcmTokens = user.fcmTokens || [];
        user.fcmTokens.push(fcmToken);
        await user.save();
      }
      return user;
    }

    const newUser = new this.userModel({
      uid,
      email,
      name,
      role: 'user',
      fcmTokens: fcmToken ? [fcmToken] : [],
    });

    return newUser.save();
  }

  async getAdminTokens(): Promise<string[]> {
    const admins = await this.userModel.find({ role: 'admin' });

    // Gộp tất cả fcmTokens của các admin thành 1 mảng duy nhất
    const tokens = admins.flatMap((admin) => admin.fcmTokens || []);

    return [...new Set(tokens)];
  }
}
