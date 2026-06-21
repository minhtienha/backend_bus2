import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

@Injectable()
export class UploadsService {
  private bucket: GridFSBucket;

  constructor(
    @InjectConnection()
    private connection: Connection,
  ) {}

  onModuleInit() {
    this.bucket = new GridFSBucket(this.connection.db as any, {
      bucketName: 'uploads',
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(file.originalname, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      uploadStream.end(file.buffer);

      uploadStream.on('finish', () => {
        resolve({
          _id: uploadStream.id,
          filename: file.originalname,
          contentType: file.mimetype,
          message: 'Upload thành công!',
        });
      });

      uploadStream.on('error', reject);
    });
  }

  async getFiles() {
    const files = await this.bucket.find().toArray();
    return files;
  }

  async getFileStream(id: string) {
    const objectId = new ObjectId(id);

    const fileInfo = await this.connection
      .db!.collection('uploads.files')
      .findOne({ _id: objectId });

    if (!fileInfo) {
      throw new NotFoundException('Không tìm thấy file');
    }

    const stream = this.bucket.openDownloadStream(objectId);
    return { stream, fileInfo };
  }

  async deleteFile(id: string) {
    return this.bucket.delete(new ObjectId(id));
  }
}
