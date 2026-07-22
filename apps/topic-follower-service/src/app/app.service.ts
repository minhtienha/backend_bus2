import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TopicFollower,
  TopicFollowerDocument,
  SubscribeTopicDto,
  Topic,
  TopicDocument,
} from '@bus/models';
import { Injectable } from '@nestjs/common';

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

  async getSubscribedTopics(userId: string): Promise<any[]> {
    const follows = await this.topicFollowerModel
      .find({ userId })
      .populate('topicId')
      .exec();

    return follows.filter((f) => f.topicId != null).map((f) => f.topicId);
  }

  async getTopicsWithSubscriptionStatus(userId: string) {
    const allTopics = await this.topicModel.find().lean().exec();

    const userSubscriptions = await this.topicFollowerModel
      .find({ userId })
      .select('topicId')
      .lean()
      .exec();

    const subscribedTopicIds = new Set(
      userSubscriptions.map((sub) => sub.topicId.toString()),
    );

    const result = allTopics.map((topic) => {
      return {
        ...topic,
        isSubscribed: subscribedTopicIds.has(topic._id.toString()),
      };
    });

    return result;
  }
}
