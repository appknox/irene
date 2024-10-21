import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type AnalysisModel from 'irene/models/analysis';

export interface FileCompareAnalysisDetailsSignature {
  Element: HTMLElement;
  Args: {
    analysis?: AnalysisModel;
    analysisStatus: string;
  };
}

export default class FileCompareAnalysisDetailsComponent extends Component<FileCompareAnalysisDetailsSignature> {
  @service declare intl: IntlService;

  get analysis() {
    return this.args.analysis || null;
  }

  get isMarkedAsPassed() {
    return this.analysis?.overriddenRisk === ENUMS.RISK.NONE;
  }

  get isMarkedAsPassedOrRisky() {
    return this.isMarkedAsPassed || this.analysis?.isRisky;
  }

  get vulnerability() {
    return this.analysis?.vulnerability || null;
  }

  get vulnerabilityDescription() {
    if (this.analysis?.isScanning) {
      return htmlSafe(this.vulnerability?.get?.('question') || '');
    }

    if (this.isMarkedAsPassedOrRisky) {
      return this.vulnerability?.get?.('descriptionUnescapedd');
    }

    return htmlSafe(this.vulnerability?.get?.('successMessage') || '');
  }

  get businessImplication() {
    return htmlSafe(this.vulnerability?.get?.('businessImplication') || '');
  }

  get compliantSolution() {
    return htmlSafe(this.vulnerability?.get?.('compliant') || '');
  }

  get nonCompliantCodeExample() {
    return htmlSafe(this.vulnerability?.get?.('nonCompliant') || '');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::AnalysisDetails': typeof FileCompareAnalysisDetailsComponent;
  }
}
