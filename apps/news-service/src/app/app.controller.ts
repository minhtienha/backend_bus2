import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
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
}
