import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { action } from '@ember/object';

import { Calendar } from '..';
import { humanizeMonths } from 'irene/utils/date-time';

export interface AkDatePickerCalendarNavSignature {
  Args: {
    calendar: Calendar;
  };
}

export default class AkDatePickerCalendarNavComponent extends Component<AkDatePickerCalendarNavSignature> {
  get centerMonth() {
    return this.monthNames[dayjs(this.args.calendar.center).month()];
  }

  get centerYear() {
    return dayjs(this.args.calendar.center).year();
  }

  get monthNames() {
    return humanizeMonths();
  }

  @action
  handleMoveCenter(step: number, unit: 'month' | 'year', event: Event) {
    const calendar = this.args.calendar;

    calendar.actions.moveCenter?.(step, unit, calendar, event);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkDatePicker::CalendarNav': typeof AkDatePickerCalendarNavComponent;
  }
}
