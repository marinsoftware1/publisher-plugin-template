import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import * as os from 'os';
import { LogObject } from './models/log-object.model';
import { RequestCustom } from './models/request-details.interface';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  logObject: LogObject;
  constructor(private logger: Logger) {
    this.logObject = new LogObject();
  }

  use(request: RequestCustom, response: Response, next: NextFunction): void {
    const startAt = process.hrtime();
    const { method, originalUrl, errorEmitted } = request;
    this.logObject.isSuccess = !errorEmitted;
    this.logObject.url_path = originalUrl;
    this.logObject.size = +response.get('content-length');
    this.logObject.host = os.hostname();
    this.logObject.startTimeDate = Date.now();
    this.logObject.requestType = method;
    response.on('finish', () => {
      const diff = process.hrtime(startAt);
      this.logObject.duration = diff[0] * 1e3 + diff[1] * 1e-6;
      this.logger.log(this.logObject);
    });

    next();
  }
}
