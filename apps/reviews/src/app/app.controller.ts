import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateReviewDto } from '@bus/models';

@Controller('reviews')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  createData(@Body() data: CreateReviewDto) {
    return this.appService.create(data);
  }

  @Get()
  getAllData() {
    return this.appService.findAll();
  }

  @Get(':id')
  getDataById(@Param('id') id: string) {
    return this.appService.findById(id);
  }

  @Patch(':id')
  updateData(@Param('id') id: string, @Body() data: Partial<CreateReviewDto>) {
    return this.appService.update(id, data);
  }

  @Delete(':id')
  deleteData(@Param('id') id: string) {
    return this.appService.delete(id);
  }
}
