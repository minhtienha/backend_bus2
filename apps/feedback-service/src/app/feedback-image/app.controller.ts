import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FeedbackImage } from '@bus/models';
import { FeedbackImageService } from './app.service';

@Controller('feedback-images')
export class FeedbackImageController {
  constructor(public readonly service: FeedbackImageService) {}

  @Post()
  async create(@Body() body: Partial<FeedbackImage>) {
    return this.service.create(body);
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
  async update(@Param('id') id: string, @Body() body: Partial<FeedbackImage>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
