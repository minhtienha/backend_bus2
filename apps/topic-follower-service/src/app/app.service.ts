import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TopicFollower,
  TopicFollowerDocument,
  SubscribeTopicDto,
} from '@bus/models';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(TopicFollower.name)
    private readonly topicFollowerModel: Model<TopicFollowerDocument>,
  ) {}

  async subscribe(dto: SubscribeTopicDto) {
    const { topicId, deviceToken, userId } = dto;
    const existing = await this.topicFollowerModel.findOne({
      topicId,
      deviceToken,
    });
    if (existing) {
      return existing;
    }
    const follower = new this.topicFollowerModel({
      topicId,
      deviceToken,
      userId,
    });
    return await follower.save();
  }

  async unsubscribe(dto: SubscribeTopicDto) {
    const { topicId, deviceToken } = dto;
    await this.topicFollowerModel.deleteOne({ topicId, deviceToken });
    return { success: true, message: 'Unsubscribed successfully' };
  }
}
