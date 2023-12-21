import dayjs from 'dayjs';
import { RangeDateObject } from 'irene/components/ak-date-picker';

const setRangeSelectionValue = (
  start: dayjs.Dayjs | null,
  end: dayjs.Dayjs | null
): RangeDateObject => {
  return {
    date: { start: start?.toDate() ?? null, end: end?.toDate() ?? null },
    dayjs: { start, end },
  };
};

export const SINGLE_QUICK_SELECT_OPTIONS = {
  clear: {
    label: 'Clear',
    value: null,
  },
};

export const MULTIPLE_QUICK_SELECT_OPTIONS = {
  clear: {
    label: 'Clear',
    value: { date: [], dayjs: [] },
  },
  today: {
    label: 'Today',
    value: { date: [new Date()], dayjs: [dayjs()] },
  },
};

export const RANGE_QUICK_SELECT_OPTIONS = {
  clear: {
    label: 'Clear',
    value: setRangeSelectionValue(null, null),
  },
  last7Days: {
    label: 'Last 7 days',
    value: setRangeSelectionValue(
      dayjs().startOf('day').subtract(6, 'days'),
      dayjs().startOf('day')
    ),
  },
  last30Days: {
    label: 'Last 30 days',
    value: setRangeSelectionValue(
      dayjs().startOf('day').subtract(29, 'days'),
      dayjs().startOf('day')
    ),
  },
  lastYear: {
    label: 'Last year',
    value: setRangeSelectionValue(
      dayjs().startOf('day').subtract(1, 'year').add(1, 'day'),
      dayjs().startOf('day')
    ),
  },
  last3Months: {
    label: 'Last 3 months',
    value: setRangeSelectionValue(
      dayjs().startOf('day').subtract(3, 'months').add(1, 'day'),
      dayjs().startOf('day')
    ),
  },
  last6Months: {
    label: 'Last 6 months',
    value: setRangeSelectionValue(
      dayjs().startOf('day').subtract(6, 'months').add(1, 'day'),
      dayjs().startOf('day')
    ),
  },
  thisWeek: {
    label: 'This week',
    value: setRangeSelectionValue(
      dayjs().startOf('week'),
      dayjs().startOf('day')
    ),
  },
  thisMonth: {
    label: 'This month',
    value: setRangeSelectionValue(
      dayjs().startOf('month'),
      dayjs().startOf('day')
    ),
  },
};
