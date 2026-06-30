import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateLocationDto } from '@bus/models';

@Controller('address')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  createData(@Body() data: CreateLocationDto) {
    return this.appService.create(data);
  }

  @Get()
  getAllData() {
    return this.appService.findAll();
  }
}
