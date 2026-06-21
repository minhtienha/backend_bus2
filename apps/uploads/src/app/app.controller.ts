import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  Req,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './app.service';
import type { Response, Request } from 'express';
import { UrlMappingInterceptor } from './url-mapping.interceptor';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // Upload
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
    UrlMappingInterceptor,
  )
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('Không có file nào được gửi lên');
    }

    return this.uploadsService.uploadFile(file);
  }

  @Get()
  async getFiles() {
    return this.uploadsService.getFiles();
  }

  // Lấy/Xem file
  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const { stream, fileInfo } = await this.uploadsService.getFileStream(id);

    const contentType =
      fileInfo.contentType ||
      fileInfo.metadata?.contentType ||
      'application/octet-stream';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${fileInfo.filename}"`,
    });

    stream.pipe(res);
  }

  // Xoá file
  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    await this.uploadsService.deleteFile(id);

    return {
      message: 'Xoá file thành công',
    };
  }
}
