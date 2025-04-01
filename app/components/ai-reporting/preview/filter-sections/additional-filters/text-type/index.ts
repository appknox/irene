import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debounceTask } from 'ember-lifeline';

import type { PreviewFilterField } from 'irene/models/report-request';

interface AiReportingPreviewFilterSectionsAdditionalFiltersTextTypeSignature {
  Args: {
    field: PreviewFilterField;
    currentValue: string | null;
    operator: string;
    onAddUpdateFilter: (
      operator: string,
      value: string | number | boolean | null
    ) => void;
  };
}

export default class AiReportingPreviewFilterSectionsAdditionalFiltersTextTypeComponent extends Component<AiReportingPreviewFilterSectionsAdditionalFiltersTextTypeSignature> {
  @tracked value = this.args.currentValue || '';

  @action
  handleAddUpdateFilter(value: string) {
    this.args.onAddUpdateFilter(this.args.operator, value);
  }

  @action
  handleValueChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;

    debounceTask(this, 'handleAddUpdateFilter', value, 500);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::AdditionalFilters::TextType': typeof AiReportingPreviewFilterSectionsAdditionalFiltersTextTypeComponent;
    'ai-reporting/preview/filter-sections/additional-filters/text-type': typeof AiReportingPreviewFilterSectionsAdditionalFiltersTextTypeComponent;
  }
}
