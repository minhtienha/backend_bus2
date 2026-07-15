import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule, FirebaseModule } from '@bus/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewsSchema, TopicFollower, TopicFollowerSchema } from '@bus/models';

@Module({
  imports: [
    CommonModule,
    FirebaseModule,
    MongooseModule.forFeature([
      { name: News.name, schema: NewsSchema },
      { name: TopicFollower.name, schema: TopicFollowerSchema },
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
