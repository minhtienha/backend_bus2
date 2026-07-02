import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('timetable')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':id/:var')
  getTimeTable(
    @Param('id', ParseIntPipe) id: number,
    @Param('var', ParseIntPipe) variant: number,
  ) {
    return this.appService.getTimeTable(id, variant);
  }
}
