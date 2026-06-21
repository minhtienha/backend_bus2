import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FeedbackHistory } from '@bus/models';
import { FeedbackHistoryService } from './app.service';

@Controller('feedback-histories')
export class FeedbackHistoryController {
  constructor(public readonly service: FeedbackHistoryService) {}

  @Post()
  async create(@Body() body: Partial<FeedbackHistory>) {
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
  async update(
    @Param('id') id: string,
    @Body() body: Partial<FeedbackHistory>,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
