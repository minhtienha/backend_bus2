import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TopicFollower,
  TopicFollowerDocument,
  SubscribeTopicDto,
  Topic,
  TopicDocument,
} from '@bus/models';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(TopicFollower.name)
    private readonly topicFollowerModel: Model<TopicFollowerDocument>,
    @InjectModel(Topic.name)
    private readonly topicModel: Model<TopicDocument>,
  ) {}

  async subscribe(userId: string, dto: SubscribeTopicDto) {
    return this.topicFollowerModel
      .findOneAndUpdate(
        { userId, topicId: dto.topicId },
        { $set: { deviceToken: dto.deviceToken } },
        { upsert: true, new: true },
      )
      .exec();
  }

  async unsubscribe(userId: string, topicId: string) {
    return this.topicFollowerModel.deleteOne({ userId, topicId }).exec();
  }

  async getSubscribedTopicIds(userId: string): Promise<string[]> {
    const follows = await this.topicFollowerModel
      .find({ userId }, 'topicId')
      .exec();
    return follows.map((f) => f.topicId.toString());
  }
}
