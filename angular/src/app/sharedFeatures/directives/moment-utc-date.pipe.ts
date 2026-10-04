import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'momentUtcDate'
})
export class MomentUtcDatePipe implements PipeTransform {

  transform(value: any, format: string): string {
    return value ? moment.utc(value).local().format(format) : '';
  }
}