import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule, FirebaseModule } from '@bus/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { MongooseModule } from '@nestjs/mongoose';
import {
  News,
  NewsSchema,
  Topic,
  TopicFollower,
  TopicFollowerSchema,
  TopicSchema,
} from '@bus/models';

@Module({
  imports: [
    CommonModule,
    FirebaseModule,
    MongooseModule.forFeature([
      { name: News.name, schema: NewsSchema },
      { name: TopicFollower.name, schema: TopicFollowerSchema },
      { name: Topic.name, schema: TopicSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
