import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface SummaryStat {
  label: string;
  value: number;
  tone: 'neutral' | 'exploited' | 'defended' | 'unassessed';
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
        value: scan.attacksLaunched ?? scan.protectionsDetected ?? 0,
        tone: 'neutral',
      },
      {
        label: this.intl.t('offensiveSecurity.bypassed'),
        value: scan.attacksExploited ?? scan.protectionsBypassed ?? 0,
        tone: 'exploited',
      },
      {
        label: this.intl.t('offensiveSecurity.resisted'),
        value: scan.attacksDefended ?? scan.protectionsResisted ?? 0,
        tone: 'defended',
      },
      {
        label: this.intl.t('offensiveSecurity.unassessed'),
        value: scan.findingsUnassessed ?? 0,
        tone: 'unassessed',
      },
    ];
  }

  get showResilience(): boolean {
    return this.args.scan.hasResilience;
  }

  get effectiveResilience(): number | null {
    return this.args.scan.effectiveResilience;
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
