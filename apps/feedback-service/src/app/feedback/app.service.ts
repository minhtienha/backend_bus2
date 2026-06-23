import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateFeedbackDto,
  Feedback,
  type FeedbackDocument,
} from '@bus/models';

interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly model: Model<FeedbackDocument>,
  ) {}

  async create(data: CreateFeedbackDto) {
    const feedback = new this.model(data);
    return (await feedback.save()).toObject();
  }

  async findAll({ page = 1, limit = 10, search = '' }: FindAllParams = {}) {
    const skip = (page - 1) * limit;
    const query = search
      ? {
          name: { $regex: search as string, $options: 'i' },
        }
      : {};

    const feedbacks = await this.model.find(query).skip(skip).limit(+limit);

    if (!feedbacks.length) {
      throw new HttpException('Không tìm thấy phản ảnh/góp ý nào', 404);
    }

    const total = await this.model.countDocuments(query);

    return {
      data: feedbacks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const feedback = await this.model.findById(id).exec();
    if (!feedback) {
      throw new HttpException('Feedback không tồn tại', HttpStatus.NOT_FOUND);
    }
    return feedback.toObject();
  }

  async update(id: string, data: Partial<CreateFeedbackDto>) {
    const feedback = await this.model
      .findByIdAndUpdate(id, data, { returnDocument: 'after' })
      .exec();
    if (!feedback) {
      throw new HttpException('Feedback không tồn tại', HttpStatus.NOT_FOUND);
    }
    return feedback.toObject();
  }

  async delete(id: string) {
    const feedback = await this.model.findByIdAndDelete(id).exec();
    if (!feedback) {
      throw new HttpException('Feedback không tồn tại', HttpStatus.NOT_FOUND);
    }
    return { message: 'Feedback đã được xóa thành công' };
  }
}
