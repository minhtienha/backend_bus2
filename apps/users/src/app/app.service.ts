import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@bus/models';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async syncUserAndToken(
    uid: string,
    email: string,
    name: string,
    fcmToken: string,
  ) {
    let user = await this.userModel.findOne({ uid });

    if (user) {
      if (fcmToken && !user.fcmTokens.includes(fcmToken)) {
        user.fcmTokens.push(fcmToken);
        await user.save();
      }
      return user;
    }

    user = new this.userModel({
      uid,
      email,
      name,
      role: 'USER',
      fcmTokens: fcmToken ? [fcmToken] : [],
    });

    return user.save();
  }

  async getAdminTokens(): Promise<string[]> {
    const admins = await this.userModel.find({ role: 'ADMIN' });
    const tokens = admins.flatMap((admin) => admin.fcmTokens || []);
    return [...new Set(tokens)];
  }
}
