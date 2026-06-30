import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, CreateLocationDto } from '@bus/models';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Location.name) public locationService: Model<Location>,
  ) {}

  async findAll() {
    const data = await this.locationService.find().exec();
    return data.map((item) => ({
      name: item.name,
      coordinates: item.coordinates,
    }));
  }

  async create(data: CreateLocationDto) {
    const location = new this.locationService(data);
    const savedLocation = (await location.save()).toObject();

    return {
      code: 'LOCATION_CREATED',
      message: 'Tạo mới địa điểm thành công',
      data: savedLocation,
    };
  }
}
