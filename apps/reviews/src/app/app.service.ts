import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReviewDto, Review, type ReviewDocument } from '@bus/models';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Review.name)
    public reviewService: Model<ReviewDocument>,
  ) {}

  async create(data: CreateReviewDto) {
    const review = new this.reviewService(data);
    return (await review.save()).toObject();
  }

  async findAll() {
    return await this.reviewService.find().exec();
  }

  async findById(routeId: string) {
    const reviews = await this.reviewService
      .find({ routeName: { $regex: routeId, $options: 'i' } })
      .exec();

    const totalReviews = reviews.length;

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews ||
      0;

    const ratingDistribution = {
      1: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      5: { count: 0, percentage: 0 },
    };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating as 1 | 2 | 3 | 4 | 5].count++;
      }
    });

    if (totalReviews > 0) {
      Object.keys(ratingDistribution).forEach((key) => {
        const star = Number(key) as 1 | 2 | 3 | 4 | 5;
        const count = ratingDistribution[star].count;

        ratingDistribution[star].percentage =
          Math.round((count / totalReviews) * 100 * 10) / 10;
      });
    }

    return {
      reviews,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    };
  }

  async update(id: string, data: Partial<CreateReviewDto>) {
    const review = await this.reviewService
      .findByIdAndUpdate(id, data, { returnDocument: 'after' })
      .exec();
    if (!review) {
      throw new HttpException('Không tìm thấy đánh giá', HttpStatus.NOT_FOUND);
    }
    return review.toObject();
  }

  async delete(id: string) {
    const review = await this.reviewService.findByIdAndDelete(id).exec();
    if (!review) {
      throw new HttpException('Không tìm thấy đánh giá', HttpStatus.NOT_FOUND);
    }
    return { message: 'Đánh giá đã được xóa thành công' };
  }
}
