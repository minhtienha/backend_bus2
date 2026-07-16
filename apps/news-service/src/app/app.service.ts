import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  News,
  NewsDocument,
  Topic,
  TopicDocument,
  TopicFollower,
  TopicFollowerDocument,
  CreateNewsDto,
} from '@bus/models';
import { FirebaseService } from '@bus/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(News.name)
    private readonly newsModel: Model<NewsDocument>,
    @InjectModel(Topic.name)
    private readonly topicModel: Model<TopicDocument>,
    @InjectModel(TopicFollower.name)
    private readonly topicFollowerModel: Model<TopicFollowerDocument>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async getNews() {
    return await this.newsModel.find().lean();
  }

  async getOneNews(id: string) {
    return await this.newsModel.findById(id).lean();
  }

  async createNews(dto: CreateNewsDto) {
    const exisTopic = await this.topicModel.findById(dto.topicId);
    if (!exisTopic) {
      throw new NotFoundException('Chủ đề (Topic) không tồn tại');
    }

    const existingNews = await this.newsModel.findOne({
      topicId: dto.topicId,
      title: dto.title.trim(),
    });

    if (existingNews) {
      console.log(
        `[News] Phát hiện bài viết trùng tiêu đề trong cùng Topic. Tự động trả về bản ghi cũ.`,
      );
      return existingNews;
    }

    const news = new this.newsModel(dto);
    const savedNews = await news.save();

    const followers = await this.topicFollowerModel
      .find({ topicId: dto.topicId })
      .select('deviceToken')
      .lean();

    const tokens = followers.map((f) => f.deviceToken).filter(Boolean);

    if (tokens.length > 0) {
      const messages = tokens.map((token) => ({
        token: token,
        notification: {
          title: savedNews.title,
          body: savedNews.content,
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          type: 'NEW_NEWS_ALERT',
          topicId: String(savedNews.topicId),
          newsId: String(savedNews._id),
        },
      }));

      try {
        await this.firebaseService.messaging.sendEach(messages);
        this.logger.log(
          `[FCM] Sent notifications to ${tokens.length} devices for news: ${savedNews._id}`,
        );
      } catch (error: any) {
        this.logger.error(
          `[FCM] Failed to send notifications: ${error.message}`,
          error.stack,
        );
      }
    }

    return savedNews;
  }
}
