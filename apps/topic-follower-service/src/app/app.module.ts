import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from '@bus/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicFollower, TopicFollowerSchema, TopicSchema } from '@bus/models';
import { FirebaseModule } from '@bus/common';

@Module({
  imports: [
    CommonModule,
    FirebaseModule,
    MongooseModule.forFeature([
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
