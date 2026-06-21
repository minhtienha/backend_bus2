import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request } from 'express';

@Injectable()
export class UrlMappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        if (data && data._id) {
          const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${data._id}`;
          return {
            ...data,
            url: fileUrl,
          };
        }
        return data;
      }),
    );
  }
}
