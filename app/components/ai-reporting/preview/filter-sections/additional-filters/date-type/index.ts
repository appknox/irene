import Component from '@glimmer/component';
import { action } from '@ember/object';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';
import type { CalendarSelectValue } from 'irene/components/ak-date-picker';

import type {
  PreviewFilterField,
  AdditionalFilterFilterDetailsExpressionValues,
} from 'irene/models/ai-reporting/report-request';

interface AiReportingPreviewFilterSectionsAdditionalFiltersDateTypeSignature {
  Args: {
    field: PreviewFilterField;
    operator: string;
    isErrored: boolean;
    currentValue:
      | AdditionalFilterFilterDetailsExpressionValues
      | AdditionalFilterFilterDetailsExpressionValues[];

    onAddUpdateFilter: (
      operator: string,
      value: AdditionalFilterFilterDetailsExpressionValues
    ) => void;
  };
}

export default class AiReportingPreviewFilterSectionsAdditionalFiltersDateTypeComponent extends Component<AiReportingPreviewFilterSectionsAdditionalFiltersDateTypeSignature> {
  get currentValue() {
    const value = this.args.currentValue;

    if (this.isMultipleDateSelect) {
      return ((value as string[] | null)?.map(this.convertToDate) ?? null) as
        | Date[]
        | null;
    }

    if (this.isRangeDate) {
      const [startDate, endDate] = (value as string[] | null) || [null, null];

      return {
        start: startDate ? this.convertToDate(startDate) : null,
        end: endDate ? this.convertToDate(endDate) : null,
      };
    }

    return this.convertToDate(value as string);
  }

  get rangeDate() {
    return this.currentValue as { start: Date | null; end: Date | null };
  }

  get multipleDates() {
    return this.currentValue as Date[];
  }

  get singleDate() {
    return this.currentValue as Date;
  }

  get maxDate() {
    return dayjs().toDate();
  }

  get singleDateDisplayValue() {
    return this.formatDate(this.singleDate, 'DD MMM, YYYY');
  }

  get rangeDateDisplayValues() {
    return {
      start: this.formatDate(this.rangeDate?.start, 'DD MMM, YYYY'),
      end: this.formatDate(this.rangeDate?.end, 'DD MMM, YYYY'),
    };
  }

  get isMultipleDateSelect() {
    return [
      ENUMS.AI_REPORTING_FILTER_OPERATOR.IN,
      ENUMS.AI_REPORTING_FILTER_OPERATOR.NOT_IN,
    ].includes(this.args.operator);
  }

  get isRangeDate() {
    return this.args.operator === ENUMS.AI_REPORTING_FILTER_OPERATOR.RANGE;
  }

  get hasMultipleDates() {
    return this.currentValue && Array.isArray(this.currentValue)
      ? this.currentValue.length > 0
      : false;
  }

  @action
  getMultipleDateDisplayValue(date: Date) {
    return this.formatDate(date, 'DD/MM/YY');
  }

  @action
  convertToDate(date?: string | null) {
    return date ? dayjs(date).toDate() : null;
  }

  @action
  formatDate(date: Date | null, format = '') {
    return date ? dayjs(date).format(format) : '';
  }

  // On multiple date item delete
  @action
  onDeleteDate(date: Date) {
    const updatedSelectedDate = (this.currentValue as Date[]).filter(
      (d) => this.formatDate(d) !== this.formatDate(date)
    );

    this.onDateChange(updatedSelectedDate);
  }

  @action
  onSelectDay(selectedDate: CalendarSelectValue) {
    const selectedDateValue = selectedDate?.date ?? null;

    // Multiple dates
    if (this.isMultipleDateSelect && Array.isArray(selectedDateValue)) {
      this.onDateChange(selectedDateValue);
    }

    // Range time
    else if (
      this.isRangeDate &&
      selectedDateValue &&
      'end' in selectedDateValue
    ) {
      this.onDateChange([selectedDateValue.start, selectedDateValue.end]);
    }

    // Single date
    else {
      this.onDateChange(selectedDateValue as Date | null);
    }
  }

  @action
  onDateChange(date: (Date | null) | (Date | null)[]) {
    // Process the date value based on its type
    const formattedDate = Array.isArray(date)
      ? date.map((d) => this.formatDate(d))
      : this.formatDate(date);

    this.args.onAddUpdateFilter(this.args.operator, formattedDate);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::AdditionalFilters::DateType': typeof AiReportingPreviewFilterSectionsAdditionalFiltersDateTypeComponent;
    'ai-reporting/preview/filter-sections/additional-filters/date-type': typeof AiReportingPreviewFilterSectionsAdditionalFiltersDateTypeComponent;
  }
}
