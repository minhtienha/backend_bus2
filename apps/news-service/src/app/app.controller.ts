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
import { CreateNewsDto } from '@bus/models';

@Controller('news')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNews(@Body() dto: CreateNewsDto) {
    return await this.appService.createNews(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getNews() {
    return await this.appService.getNews();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneNews(@Param('id') id: string) {
    return await this.appService.getOneNews(id);
  }
}
