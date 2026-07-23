import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Timetable, type TimetableDocument } from '@bus/models';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Timetable.name)
    public timetableModel: Model<TimetableDocument>,
  ) {}

  async getTimeTable(id: number, variant: number) {
    const timetable = await this.timetableModel.findOne({ id, var: variant });

    if (!timetable) {
      throw new HttpException(
        'Không tìm thấy tuyến xe này',
        HttpStatus.NOT_FOUND,
      );
    }

    const travelTime = timetable.travelTime;
    const result = [];
    console.log(this.timeToMinutes(timetable.schedule[0].startTime));
    console.log(this.timeToMinutes(timetable.schedule[0].endTime));

    console.log(
      this.minutesToTime(this.timeToMinutes(timetable.schedule[0].startTime)),
    );
    console.log(
      this.minutesToTime(this.timeToMinutes(timetable.schedule[0].endTime)),
    );

    for (const s of timetable.schedule) {
      let current = this.timeToMinutes(s.startTime);
      const end = this.timeToMinutes(s.endTime);

      while (current < end) {
        result.push({
          start: this.minutesToTime(current),
          end: this.minutesToTime(current + travelTime),
        });

        current += s.interval;
      }
    }

    return result;
  }

  private timeToMinutes(time: string): number {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  }

  private minutesToTime(minutes: number): string {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    return `${hour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
  }

  async getTimeBusTo(id: number, variant: number): Promise<any> {
    const scheduleList = await this.getTimeTable(id, variant);

    if (!scheduleList || scheduleList.length === 0) {
      throw new HttpException(
        'Không có lịch trình cho tuyến xe này',
        HttpStatus.NOT_FOUND,
      );
    }

    const now = new Date();

    const vnTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
    );

    const currentHour = vnTime.getHours();
    const currentMinute = vnTime.getMinutes();

    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    for (const trip of scheduleList) {
      const tripStartMinutes = this.timeToMinutes(trip.start);

      if (tripStartMinutes >= currentTimeInMinutes) {
        const eta = tripStartMinutes - currentTimeInMinutes;

        if (eta <= 1) {
          return {
            eta: eta,
            licensePlate: '51B-123.45',
          };
        }

        return {
          eta: eta,
        };
      }
    }

    return -1;
  }
}
