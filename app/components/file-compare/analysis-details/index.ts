import Component from '@glimmer/component';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';
import type AnalysisModel from 'irene/models/analysis';

export interface FileCompareAnalysisDetailsSignature {
  Element: HTMLElement;
  Args: {
    analysis?: AnalysisOverviewModel;
    analysisStatus: string;
  };
}

export default class FileCompareAnalysisDetailsComponent extends Component<FileCompareAnalysisDetailsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked analysis: AnalysisModel | null = null;

  constructor(
    owner: object,
    args: FileCompareAnalysisDetailsSignature['Args']
  ) {
    super(owner, args);

    this.reloadAnalysis.perform();
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

  reloadAnalysis = task(async () => {
    if (!this.args.analysis?.id) {
      return;
    }

    this.analysis = await this.store.findRecord(
      'analysis',
      String(this.args.analysis.id),
      { reload: true }
    );
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::AnalysisDetails': typeof FileCompareAnalysisDetailsComponent;
  }
}
