import Component from '@glimmer/component';
import { Placement, Modifier } from '@popperjs/core';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import dayjs from 'dayjs';

import {
  SINGLE_QUICK_SELECT_OPTIONS,
  RANGE_QUICK_SELECT_OPTIONS,
  MULTIPLE_QUICK_SELECT_OPTIONS,
} from 'irene/utils/ak-date-picker-options';

export type DateObject = { date: Date; dayjs: dayjs.Dayjs };

export type RangeDateObject = {
  date: { start: Date | null; end: Date | null };
  dayjs: { start: dayjs.Dayjs | null; end: dayjs.Dayjs | null };
};

export type MultipleDateObject = { date: Date[]; dayjs: dayjs.Dayjs[] };

export type CalendarType = 'multiple' | 'range' | 'single';

export interface Calendar {
  uniqueId: string;
  selected: Date | RangeDateObject['date'] | MultipleDateObject['date'];
  center: Date;
  loading: boolean;
  locale: string;
  type: CalendarType;
  actions: CalendarActions;
}

export interface CalendarDay {
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

export type CalendarOnSelectFunc = (
  value: CalendarDay | RangeDateObject | MultipleDateObject | null,
  calendar: Calendar,
  event: Event,
  datePickerCloseHanlder: () => void
) => void;

export type CalendarOnCenterChangeFunc = (
  center: DateObject,
  calendar: Calendar,
  event: Event
) => void;

export type CalendarMoveCenterFunc = (
  step: number,
  unit: 'month' | 'year',
  calendar: Calendar,
  event: Event
) => void;

export interface CalendarActions {
  changeCenter?: CalendarOnCenterChangeFunc;

  select?: (
    value: CalendarDay | RangeDateObject | MultipleDateObject | null,
    calendar: Calendar,
    event: Event
  ) => void;

  moveCenter?: CalendarMoveCenterFunc;
}

type PopoverArgs = {
  renderInPlace?: boolean;
  placement?: Placement;
  modifiers?: Partial<Modifier<string, object>>[];
  popoverContainerClass?: string;
  hasBackdrop?: boolean;
  clickOutsideToClose?: boolean;
  mountOnOpen?: boolean;
  unmountOnClose?: boolean;
  onOpen?: (event: MouseEvent) => void;
  onClose?: () => void;
};

type PowerCalendarCommonArgs = {
  center?: Date;
  selected?: Date | RangeDateObject['date'] | MultipleDateObject['date'] | null;
  onSelect?: CalendarOnSelectFunc;
  onCenterChange?: CalendarOnCenterChangeFunc;
};

type PowerCalendarDayArgs = {
  dayClass?: string;
  startOfWeek?: number;
  weekdayFormat?: 'min' | 'short' | 'long';
  showDaysAround?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
};

type PowerCalendarRangeArgs = {
  range?: boolean;
  minRange?: number | string;
  maxRange?: number | string;
  proximitySelection?: boolean;
};

type PowerCalendarMultipleArgs = {
  multiple?: boolean;
  maxLength?: number;
};

type AkDatePickerCustomArgs = {
  closeOnSelect?: boolean;
  hideQuickSelectOptions?: boolean;
  quickSelectTitle?: string;
  quickSelectOptions?: string[] | { key: string; label: string }[] | null;
  customQuickSelectOptions?: QuickSelectionObject[];
};

type QuickSelectionObject = {
  label: string;
  value: null | CalendarDay | RangeDateObject | MultipleDateObject;
};

type CalendarQuickSelection = Record<
  CalendarType,
  Record<string, QuickSelectionObject>
>;

export interface AkDatePickerSignature {
  Args: PopoverArgs &
    PowerCalendarCommonArgs &
    PowerCalendarRangeArgs &
    PowerCalendarMultipleArgs &
    PowerCalendarDayArgs &
    AkDatePickerCustomArgs;
  Element: HTMLDivElement;
  Blocks: {
    default: [];
  };
}

export default class AkDatePickerComponent extends Component<AkDatePickerSignature> {
  @tracked anchorRef: HTMLElement | null = null;
  @tracked defaultCenter: Date;

  defaultQuickSelects = {
    single: ['clear'] as const,
    multiple: ['clear', 'today'] as const,
    range: [
      'clear',
      'last7Days',
      'last30Days',
      'last3Months',
      'last6Months',
    ] as const,
  };

  constructor(owner: unknown, args: AkDatePickerSignature['Args']) {
    super(owner, args);

    this.defaultCenter =
      this.getCenterForSelectedDate(this.args.selected) ||
      dayjs(new Date()).toDate();
  }

  get placement() {
    return this.args.placement || 'bottom';
  }

  get center() {
    return this.args.center || this.defaultCenter;
  }

  get closeOnSelect() {
    const closeOnSelect = this.args.closeOnSelect;

    return this.isEmpty(closeOnSelect) ? true : closeOnSelect;
  }

  get calendarType() {
    return this.args.range
      ? 'range'
      : this.args.multiple
      ? 'multiple'
      : 'single';
  }

  get componentName() {
    return this.calendarType === 'single'
      ? 'power-calendar'
      : (`power-calendar-${this.calendarType}` as const);
  }

  get navComponent() {
    return 'ak-date-picker/calendar-nav' as const;
  }

  get weekdayFormat() {
    return this.args.weekdayFormat || 'min';
  }

  get finalQuickSelectOptions() {
    const options = this.args.quickSelectOptions;

    const finalOptions = this.isEmpty(options)
      ? this.defaultQuickSelects[this.calendarType].map(
          (it) => this.quickSelectOptions[this.calendarType][it]
        )
      : options.map((it) => {
          if (typeof it === 'string') {
            return this.quickSelectOptions[this.calendarType][it];
          } else {
            return {
              ...this.quickSelectOptions[this.calendarType][it.key],
              label: it.label,
            };
          }
        });

    finalOptions.push(...(this.args.customQuickSelectOptions || []));

    return finalOptions;
  }

  get quickSelectOptions(): CalendarQuickSelection {
    return {
      single: { ...SINGLE_QUICK_SELECT_OPTIONS },
      multiple: { ...MULTIPLE_QUICK_SELECT_OPTIONS },
      range: { ...RANGE_QUICK_SELECT_OPTIONS },
    };
  }

  isEmpty(value: unknown): value is undefined | '' | null {
    return (
      value === null ||
      typeof value === 'undefined' ||
      (typeof value === 'string' && !value.trim())
    );
  }

  getCenterForSelectedDate(
    value?: Date | RangeDateObject['date'] | MultipleDateObject['date'] | null
  ) {
    if (value) {
      if (this.calendarType === 'single') {
        return value as Date;
      }

      if (this.calendarType === 'range') {
        return (value as RangeDateObject['date']).start;
      }

      return (value as MultipleDateObject['date'])[0];
    }
  }

  @action
  handleCenterChange(center: DateObject, calendar: Calendar, event: Event) {
    this.defaultCenter = center.date;

    this.args.onCenterChange?.(center, calendar, event);
  }

  @action
  handleSelectChange(
    value: CalendarDay | RangeDateObject | MultipleDateObject | null,
    calendar: Calendar,
    event: Event
  ) {
    this.args.onSelect?.(value, calendar, event, this.handlePopoverClose);

    if (this.closeOnSelect) {
      const hasValueForSingle = this.calendarType === 'single' && value?.date;

      const hasValueForRange =
        this.calendarType === 'range' &&
        (value as RangeDateObject | null)?.date?.start &&
        (value as RangeDateObject | null)?.date?.end;

      if (hasValueForSingle || hasValueForRange) {
        this.handlePopoverClose();
      }
    }
  }

  @action
  handleQuickSelectClick(
    value: CalendarDay | RangeDateObject | MultipleDateObject | null,
    calendar: Calendar,
    event: Event
  ) {
    this.handleSelectChange(value, calendar, event);

    // move center for quick select
    const centerDate = this.getCenterForSelectedDate(value?.date);

    if (centerDate) {
      const centerDateObj = {
        date: centerDate,
        dayjs: dayjs(centerDate),
      };

      this.handleCenterChange(centerDateObj, calendar, event);
    }
  }

  @action
  handlePopoverOpen(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;

    this.args.onOpen?.(event);
  }

  @action
  handlePopoverClose() {
    this.anchorRef = null;

    this.args.onClose?.();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkDatePicker: typeof AkDatePickerComponent;
  }
}
