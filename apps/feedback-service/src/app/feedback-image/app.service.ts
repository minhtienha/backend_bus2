import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedbackImage, type FeedbackImageDocument } from '@bus/models';

@Injectable()
export class FeedbackImageService {
  constructor(
    @InjectModel(FeedbackImage.name)
    private readonly model: Model<FeedbackImageDocument>,
  ) {}

  async create(data: Partial<FeedbackImage>) {
    const feedbackImage = new this.model(data);
    return (await feedbackImage.save()).toObject();
  }

  async findAll() {
    return await this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const feedbackImage = await this.model.findById(id).exec();
    if (!feedbackImage) {
      throw new HttpException(
        'Feedback image không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }
    return feedbackImage.toObject();
  }

  async update(id: string, data: Partial<FeedbackImage>) {
    const feedbackImage = await this.model
      .findByIdAndUpdate(id, data, { returnDocument: 'after' })
      .exec();
    if (!feedbackImage) {
      throw new HttpException(
        'Feedback image không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }
    return feedbackImage.toObject();
  }

  async delete(id: string) {
    const feedbackImage = await this.model.findByIdAndDelete(id).exec();
    if (!feedbackImage) {
      throw new HttpException(
        'Feedback image không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Feedback image đã được xóa thành công' };
  }
}
