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

    return await this.topicFollowerModel.updateOne(
      { userId, topicId }, // Điều kiện tìm kiếm
      {
        $set: { deviceToken }, // Nếu đã có, cập nhật lại token đề phòng token đổi
      },
      { upsert: true }, // Nếu chưa có thì tạo bản ghi mới
    );
  }

  async unsubscribe(userId: string, topicId: string) {
    // Xóa thẳng tay, không để lại dấu vết
    const result = await this.topicFollowerModel.deleteOne({ userId, topicId });

    if (result.deletedCount === 0) {
      // Có thể quăng lỗi NotFoundException nếu thích chặt chẽ
    }

    return { success: true, message: 'Unsubscribed successfully' };
  }

  async getMySubscribedTopicIds(userId: string): Promise<string[]> {
    const subscriptions = await this.topicFollowerModel
      .find({ userId })
      .select('topicId')
      .lean();

    return subscriptions.map((sub) => sub.topicId.toString());
  }
}
