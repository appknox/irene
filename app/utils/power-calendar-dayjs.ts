import dayjs from 'dayjs';
import weekdayPlugin from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import isoWeek from 'dayjs/plugin/isoWeek';
import duration from 'dayjs/plugin/duration';
import isBetweenPlugin from 'dayjs/plugin/isBetween';

dayjs.extend(localeData);
dayjs.extend(weekdayPlugin);
dayjs.extend(isoWeek);
dayjs.extend(duration);
dayjs.extend(isBetweenPlugin);

interface CalendarDay {
  id: string;
  number: number;
  date: Date;
  dayjs: dayjs.Dayjs;
  isFocused: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}

type DateType = string | number | Date | dayjs.Dayjs;
type RangeDateValue = { date: { start: Date | null; end: Date | null } };
type MultipleDateValue = { date: Date[] | null };
type ISOUnitType = dayjs.UnitType | 'week';

export function add(
  date: DateType,
  quantity: number,
  unit: dayjs.ManipulateType
) {
  return dayjs(date).add(quantity, unit).toDate();
}

export function formatDate(date: DateType, format: string, locale = null) {
  if (locale) {
    return withLocale(locale, () => dayjs(date).format(format));
  } else {
    return dayjs(date).format(format);
  }
}

export function startOf(date: DateType, unit: ISOUnitType) {
  return dayjs(date).startOf(unit).toDate();
}

export function endOf(date: DateType, unit: ISOUnitType) {
  return dayjs(date).endOf(unit).toDate();
}

export function weekday(date: DateType) {
  return dayjs(date).weekday();
}

export function isoWeekday(date: DateType) {
  return dayjs(date).isoWeekday();
}

export function getWeekdaysShort() {
  return dayjs.weekdaysShort();
}

export function getWeekdaysMin() {
  return dayjs.weekdaysMin();
}

export function getWeekdays() {
  return dayjs.weekdays();
}

export function isAfter(date1: DateType, date2: DateType) {
  return dayjs(date1).isAfter(date2);
}

export function isBefore(date1: DateType, date2: DateType) {
  return dayjs(date1).isBefore(date2);
}

export function isSame(date1: DateType, date2: DateType, unit: ISOUnitType) {
  return dayjs(date1).isSame(date2, unit);
}

export function isBetween(
  date: DateType,
  start: DateType,
  end: DateType,
  unit: dayjs.OpUnitType,
  inclusivity: '()' | '[]' | '[)' | '(]'
) {
  return dayjs(date).isBetween(start, end, unit, inclusivity);
}

export function diff(date1: DateType, date2: DateType) {
  return dayjs(date1).diff(date2);
}

export function normalizeDate(dateOrDayjs: DateType) {
  if (
    dateOrDayjs === undefined ||
    dateOrDayjs === null ||
    dateOrDayjs === '' ||
    typeof dateOrDayjs === 'number' ||
    typeof dateOrDayjs === 'string' ||
    dateOrDayjs instanceof Date
  ) {
    return dateOrDayjs;
  } else {
    return dateOrDayjs.toDate();
  }
}

export function normalizeRangeActionValue(val: RangeDateValue) {
  return {
    date: val.date,
    dayjs: {
      start: val.date.start ? dayjs(val.date.start) : val.date.start,
      end: val.date.end ? dayjs(val.date.end) : val.date.end,
    },
  };
}

export function normalizeMultipleActionValue(val: MultipleDateValue) {
  return {
    date: val.date,
    dayjs: val.date ? val.date.map((e) => dayjs(e)) : val.date,
  };
}

export function normalizeCalendarDay(day: CalendarDay) {
  day.dayjs = dayjs(day.date);
  return day;
}

export function withLocale(locale: string, fn: () => any) {
  let returnValue;

  if (locale) {
    const previousLocale = dayjs.locale();

    dayjs.locale(locale);

    returnValue = fn();

    dayjs.locale(previousLocale);
  } else {
    returnValue = fn();
  }

  return returnValue;
}

export function normalizeCalendarValue(value?: { date?: Date }) {
  if (value) {
    return {
      date: value.date,
      dayjs: value.date ? dayjs(value.date) : undefined,
    };
  }

  return { date: undefined, dayjs: undefined };
}

export function normalizeDuration(value: unknown) {
  if (value === null) {
    return null;
  }

  if (dayjs.isDuration(value)) {
    return value.asMilliseconds();
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const [, quantity, units] = value.match(/(\d+)(.*)/) || [];

    const val = (units?.trim() || 'days') as plugin.DurationUnitType;

    return dayjs.duration(parseInt(quantity ?? '', 10), val).asMilliseconds();
  }
}

export function getDefaultLocale() {
  return dayjs.locale();
}

export function localeStartOfWeek(locale: string) {
  const now = new Date();

  const day = withLocale(locale, () =>
    formatDate(startOf(now, 'week'), 'dddd')
  );

  const idx = withLocale(locale, getWeekdays).indexOf(day);

  return idx >= 0 ? idx : 0;
}

export function startOfWeek(day: DateType, startOfWeek: number) {
  while (isoWeekday(day) % 7 !== startOfWeek) {
    day = add(day, -1, 'day');
  }

  return day;
}

export function endOfWeek(day: DateType, startOfWeek: number) {
  const eow = (startOfWeek + 6) % 7;

  while (isoWeekday(day) % 7 !== eow) {
    day = add(day, 1, 'day');
  }

  return day;
}

export default {
  add,
  formatDate,
  startOf,
  endOf,
  weekday,
  isoWeekday,
  getWeekdaysShort,
  getWeekdaysMin,
  getWeekdays,
  isAfter,
  isBefore,
  isSame,
  isBetween,
  diff,
  normalizeDate,
  normalizeRangeActionValue,
  normalizeMultipleActionValue,
  normalizeCalendarDay,
  withLocale,
  normalizeCalendarValue,
  normalizeDuration,
  getDefaultLocale,
  localeStartOfWeek,
  startOfWeek,
  endOfWeek,
};
