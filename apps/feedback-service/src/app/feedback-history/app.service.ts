import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedbackHistory, type FeedbackHistoryDocument } from '@bus/models';

@Injectable()
export class FeedbackHistoryService {
  constructor(
    @InjectModel(FeedbackHistory.name)
    private readonly model: Model<FeedbackHistoryDocument>,
  ) {}

  async create(data: Partial<FeedbackHistory>) {
    const feedbackHistory = new this.model(data);
    return (await feedbackHistory.save()).toObject();
  }

  async findAll() {
    return await this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const feedbackHistory = await this.model.findById(id).exec();
    if (!feedbackHistory) {
      throw new HttpException(
        'Feedback history không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }
    return feedbackHistory.toObject();
  }

  async update(id: string, data: Partial<FeedbackHistory>) {
    const feedbackHistory = await this.model
      .findByIdAndUpdate(id, data, { returnDocument: 'after' })
      .exec();
    if (!feedbackHistory) {
      throw new HttpException(
        'Feedback history không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }
    return feedbackHistory.toObject();
  }

  async delete(id: string) {
    const feedbackHistory = await this.model.findByIdAndDelete(id).exec();
    if (!feedbackHistory) {
      throw new HttpException(
        'Feedback history không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Feedback history đã được xóa thành công' };
  }
}
