import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { QueryPlanDto } from '@bus/models';
import { AppService } from './app.service';

@Controller('plan')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  @UsePipes(ZodValidationPipe)
  getRoutePlan(@Query() query: QueryPlanDto) {
    return this.appService.getPlan(query);
  }
}
