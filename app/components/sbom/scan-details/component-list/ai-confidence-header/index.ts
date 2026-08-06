import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

export interface AiConfidenceHeaderComponentSignature {
  Args: {
    onAiConfidenceChange: (confidence: string | null) => void;
    selectedAiConfidence?: string | null;
  };
}

export default class AiConfidenceHeaderComponent extends Component<AiConfidenceHeaderComponentSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get confidenceOptions() {
    return [
      { key: this.intl.t('all'), value: null },
      { key: 'High', value: 'high' },
      { key: 'Medium', value: 'medium' },
      { key: 'Low', value: 'low' },
    ];
  }

  get selectedAiConfidence() {
    return this.args.selectedAiConfidence ?? null;
  }

  get filterApplied() {
    return this.selectedAiConfidence !== null;
  }

  @action handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action handleOptionsClose() {
    this.anchorRef = null;
  }

  @action selectAiConfidence(value: string | null) {
    this.anchorRef = null;

    this.args.onAiConfidenceChange(value);
  }

  @action clearFilter() {
    this.anchorRef = null;

    this.args.onAiConfidenceChange(null);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::AiConfidenceHeader': typeof AiConfidenceHeaderComponent;
  }
}
