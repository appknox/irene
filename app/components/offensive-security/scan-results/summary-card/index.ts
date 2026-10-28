import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type OffsecScanModel from 'irene/models/offsec-scan';
import type { OffsecScanArtifact } from 'irene/models/offsec-scan';

export interface SummaryStat {
  label: string;
  value: number;
  tone: 'neutral' | 'exploited' | 'defended';
}

export interface OffensiveSecurityScanResultsSummaryCardSignature {
  Args: {
    scan: OffsecScanModel;
    artifacts: OffsecScanArtifact[];
    onDownload: (artifact: OffsecScanArtifact | string) => void;
    isDownloading?: boolean;
  };
}

export default class OffensiveSecurityScanResultsSummaryCardComponent extends Component<OffensiveSecurityScanResultsSummaryCardSignature> {
  @service declare intl: IntlService;

  @tracked isArtifactsOpen = false;

  get artifactsCount(): number {
    return this.args.artifacts?.length ?? 0;
  }

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
    ];
  }

  get showResilience() {
    return this.args.scan.hasResilience;
  }

  get effectiveResilience() {
    return this.args.scan.effectiveResilience;
  }

  get resilienceBandLabel() {
    return (this.args.scan.resilienceBand || '').replaceAll('_', ' ');
  }

  @action
  openArtifacts(): void {
    this.isArtifactsOpen = true;
  }

  @action
  closeArtifacts(): void {
    this.isArtifactsOpen = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::SummaryCard': typeof OffensiveSecurityScanResultsSummaryCardComponent;
  }
}
