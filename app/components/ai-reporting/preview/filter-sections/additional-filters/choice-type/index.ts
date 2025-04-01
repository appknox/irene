import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type { PreviewFilterField } from 'irene/models/report-request';

interface AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeSignature {
  Args: {
    field: PreviewFilterField;
    operator: string;
    currentValue: string | number | boolean | null;
    onAddUpdateFilter: (
      operator: string,
      value: string | number | boolean | null
    ) => void;
  };
}

type ChoiceType = [string, string | number | boolean];

export default class AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeComponent extends Component<AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeSignature> {
  @tracked choiceValue: string | number | boolean | null = this.currentValue;

  get selectedChoice() {
    return this.choices?.find((c) => c.value == this.choiceValue);
  }

  get currentValue() {
    return this.args.currentValue;
  }

  get choices() {
    return (this.args.field.choices as ChoiceType[]).map((c) => ({
      label: c[0],
      value: String(c[1]),
    }));
  }

  @action
  handleChoiceSelection(selection: { label: string; value: string }) {
    this.choiceValue = selection.value;

    this.args.onAddUpdateFilter(this.args.operator, this.choiceValue);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::AdditionalFilters::ChoiceType': typeof AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeComponent;
    'ai-reporting/preview/filter-sections/additional-filters/choice-type': typeof AiReportingPreviewFilterSectionsAdditionalFiltersChoiceTypeComponent;
  }
}
