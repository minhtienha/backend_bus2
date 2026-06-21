import { Module } from '@nestjs/common';
import { UploadsController } from './app.controller';
import { UploadsService } from './app.service';
import { CommonModule } from '@bus/common';

@Module({
  imports: [CommonModule],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class AppModule {}
