import Component from '@glimmer/component';
import { action } from '@ember/object';

export interface SbomComponentInsightsPagerSignature {
  Element: HTMLElement;
  Args: {
    /** Zero-based position of the vulnerability being shown. */
    index: number;
    total: number;
    onChange: (index: number) => void;
  };
}

const pad = (value: number) => String(value).padStart(2, '0');

/** "‹ Vulnerability [01] of 03 ›" stepper over a component's vulnerabilities. */
export default class SbomComponentInsightsPagerComponent extends Component<SbomComponentInsightsPagerSignature> {
  get isFirst() {
    return this.args.index <= 0;
  }

  get isLast() {
    return this.args.index >= this.args.total - 1;
  }

  get currentLabel() {
    return pad(this.args.index + 1);
  }

  get totalLabel() {
    return pad(this.args.total);
  }

  @action
  handlePrev() {
    if (!this.isFirst) {
      this.args.onChange(this.args.index - 1);
    }
  }

  @action
  handleNext() {
    if (!this.isLast) {
      this.args.onChange(this.args.index + 1);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInsights::Pager': typeof SbomComponentInsightsPagerComponent;
    'sbom/component-insights/pager': typeof SbomComponentInsightsPagerComponent;
  }
}
