import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface SummaryStat {
  label: string;
  value: number;
  tone: 'neutral' | 'exploited' | 'defended';
}

export interface OffensiveSecurityScanResultsSummaryCardSignature {
  Args: {
    scan: OffsecScanModel;
  };
}

export default class OffensiveSecurityScanResultsSummaryCardComponent extends Component<OffensiveSecurityScanResultsSummaryCardSignature> {
  @service declare intl: IntlService;

  get stats(): SummaryStat[] {
    const { scan } = this.args;

    return [
      {
        label: this.intl.t('offensiveSecurity.protectionsDetected'),
        value: scan.protectionsDetected ?? 0,
        tone: 'neutral',
      },
      {
        label: this.intl.t('offensiveSecurity.bypassed'),
        value: scan.protectionsBypassed ?? 0,
        tone: 'exploited',
      },
      {
        label: this.intl.t('offensiveSecurity.resisted'),
        value: scan.protectionsResisted,
        tone: 'defended',
      },
    ];
  }

  /**
   * Mechanisms the agent found but never attempted. Shown only when there are any,
   * because the three counters above otherwise read as the whole story.
   */
  get showUnassessed(): boolean {
    return (this.args.scan.findingsUnassessed ?? 0) > 0;
  }

  get unassessedLabel(): string {
    return this.intl.t('offensiveSecurity.notAssessedCount', {
      count: this.args.scan.findingsUnassessed,
      total: this.args.scan.protectionsDetected,
    });
  }

  get showResilience(): boolean {
    return this.args.scan.overallResilience !== null;
  }

  get resilienceBandLabel(): string {
    return (this.args.scan.resilienceBand || '').replace(/_/g, ' ');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::SummaryCard': typeof OffensiveSecurityScanResultsSummaryCardComponent;
  }
}
