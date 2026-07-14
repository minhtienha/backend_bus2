import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule, FirebaseModule } from '@bus/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import {
  Feedback,
  FeedbackSchema,
  FeedbackImage,
  FeedbackImageSchema,
  FeedbackHistory,
  FeedbackHistorySchema,
} from '@bus/models';

import { FeedbackController } from './feedback/app.controller';
import { FeedbackService } from './feedback/app.service';

import { FeedbackHistoryController } from './feedback-history/app.controller';
import { FeedbackHistoryService } from './feedback-history/app.service';

import { FeedbackImageController } from './feedback-image/app.controller';
import { FeedbackImageService } from './feedback-image/app.service';

@Module({
  imports: [
    CommonModule,
    HttpModule,
    FirebaseModule,
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
      { name: FeedbackImage.name, schema: FeedbackImageSchema },
      { name: FeedbackHistory.name, schema: FeedbackHistorySchema },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'apps', 'public'),
      serveRoot: '/public',
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  controllers: [
    FeedbackController,
    FeedbackImageController,
    FeedbackHistoryController,
  ],
  providers: [
    FeedbackService,
    FeedbackImageService,
    FeedbackHistoryService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
