import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import type { FilterColumn } from 'irene/services/ai-reporting';

import type {
  AdditionalFilter,
  PreviewFilterDetails,
} from 'irene/models/report-request';

interface AiReportingPreviewFilterDrawerSignature {
  Args: {
    filterDetails: PreviewFilterDetails[];
    allColumnsMap: Map<string, FilterColumn>;
    additionalFilters: AdditionalFilter[];
    open: boolean;
    onClose: () => void;

    onApply: (
      allColumnsMap: Map<string, FilterColumn>,
      additionalFilters: AdditionalFilter[]
    ) => void;
  };
}

export default class AiReportingPreviewFilterDrawer extends Component<AiReportingPreviewFilterDrawerSignature> {
  @tracked allColumnsMap = new Map(this.args.allColumnsMap);
  @tracked additionalFilters = [...this.args.additionalFilters];

  @action
  handleColumnsChange(allColumnsMap: Map<string, FilterColumn>) {
    this.allColumnsMap = new Map(allColumnsMap);
  }

  @action
  handleClose() {
    this.allColumnsMap = new Map(this.args.allColumnsMap); // reset columns
    this.additionalFilters = [...this.args.additionalFilters]; // reset additional filters

    this.args.onClose();
  }

  @action
  applyAndClose() {
    this.args.onApply(this.allColumnsMap, this.additionalFilters);

    this.args.onClose();
  }

  @action
  handleAddUpdateAdditionalFilter(
    id: string,
    detail: AdditionalFilter['filter_details']
  ) {
    const index = this.additionalFilters.findIndex((f) => f.id === id);

    if (index === -1) {
      this.additionalFilters.push({ id, filter_details: detail });
    } else {
      this.additionalFilters[index] = {
        id,
        filter_details: {
          ...(this.additionalFilters[index] as AdditionalFilter).filter_details,
          ...detail,
        },
      };
    }

    this.additionalFilters = [...this.additionalFilters];
  }

  @action
  removeAdditionalFilter(id: string) {
    this.additionalFilters = this.additionalFilters.filter((f) => f.id !== id);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterDrawer': typeof AiReportingPreviewFilterDrawer;
  }
}
