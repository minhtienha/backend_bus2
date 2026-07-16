import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic, TopicDocument, CreateTopicDto } from '@bus/models';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Topic.name)
    private readonly topicModel: Model<TopicDocument>,
  ) {}

  async createTopic(dto: CreateTopicDto) {
    const topic = new this.topicModel(dto);
    return await topic.save();
  }

  async getTopics() {
    return await this.topicModel.find().lean();
  }

  async getOneTopic(id: string) {
    return await this.topicModel.findById(id).lean();
  }
}
