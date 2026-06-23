import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

    const feedback = await this.service.create({
      ...feedbackDto,
      ImageUrls: Array.isArray(ImageUrl) ? ImageUrl : [],
    } as any as CreateFeedbackDto);

    if (!Array.isArray(ImageUrl) || ImageUrl.length === 0) {
      return { feedback };
    }

    const feedbackImages = await Promise.all(
      ImageUrl.map((imageUrl: string) =>
        this.feedbackImageService.create({
          FeedbackId: feedback._id,
          ImageUrl: imageUrl,
        }),
      ),
    );

    return {
      feedback,
      feedbackImages,
    };
  }

  @Get()
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: any,
  ) {
    return this.service.findAll({ page, limit, search });
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
