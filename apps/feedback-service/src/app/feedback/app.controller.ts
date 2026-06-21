import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateFeedbackDto, Feedback } from '@bus/models';
import { FeedbackService } from './app.service';
import { FeedbackImageService } from '../feedback-image/app.service';

@Controller('feedback')
export class FeedbackController {
  constructor(
    public readonly service: FeedbackService,
    private readonly feedbackImageService: FeedbackImageService,
  ) {}

  @Post()
  async createWithImage(@Body() body: CreateFeedbackDto) {
    const { ImageUrl, ...feedbackDto } = body as any;

    const feedback = await this.service.create(
      feedbackDto as CreateFeedbackDto,
    );

    if (!ImageUrl) {
      return { feedback };
    }

    const feedbackImage = await this.feedbackImageService.create({
      FeedbackId: feedback._id,
      ImageUrl,
    });

    return {
      feedback,
      feedbackImage,
    };
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreateFeedbackDto>,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
