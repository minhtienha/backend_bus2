import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateTopicDto } from '@bus/models';

@Controller('topics')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTopic(@Body() dto: CreateTopicDto) {
    return await this.appService.createTopic(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getTopics() {
    return await this.appService.getTopics();
  }

  @Get(':/id')
  @HttpCode(HttpStatus.OK)
  async getOneTopic(@Param('id') id: string) {
    return await this.appService.getOneTopic(id);
  }
}
