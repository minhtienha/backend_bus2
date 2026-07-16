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

  async subscribe(dto: SubscribeTopicDto) {
    const { topicId, deviceToken, userId } = dto;

    const existingTopic = await this.topicModel.findById(topicId);
    if (!existingTopic) {
      throw new NotFoundException('Chủ đề (Topic) không tồn tại');
    }

    const existing = await this.topicFollowerModel.findOne({
      topicId,
      deviceToken,
    });
    if (existing) {
      throw new ConflictException('Bạn đã theo dõi Topic này rồi');
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
