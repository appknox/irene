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
  tone: 'neutral' | 'exploited';
}

export interface OffensiveSecurityScanResultsSummaryCardSignature {
  Args: {
    scan: OffsecScanModel;
    artifacts: OffsecScanArtifact[];
    onDownload: (artifact: OffsecScanArtifact | string) => void;
    onViewResults: () => void;
    isDownloading?: boolean;
  };
}

export default class OffensiveSecurityScanResultsSummaryCardComponent extends Component<OffensiveSecurityScanResultsSummaryCardSignature> {
  @service declare intl: IntlService;

  @tracked isArtifactsOpen = false;

  get artifactsCount(): number {
    return this.args.artifacts?.length ?? 0;
  }

  get businessRisksConfirmed(): number {
    return (this.args.scan.pentestGoals ?? []).reduce(
      (total, goal) =>
        total + (goal.findings_count ?? goal.findings?.length ?? 0),
      0
    );
  }

  get stats(): SummaryStat[] {
    const { scan } = this.args;
    const exploited = scan.attacksExploited ?? scan.protectionsBypassed ?? 0;

    return [
      {
        label: this.intl.t('offensiveSecurity.summary.defensesDetected'),
        value: scan.attacksLaunched ?? scan.protectionsDetected ?? 0,
        tone: 'neutral',
      },
      {
        label: this.intl.t('offensiveSecurity.summary.defensesExploited'),
        value: exploited,
        tone: exploited > 0 ? 'exploited' : 'neutral',
      },
      {
        label: this.intl.t('offensiveSecurity.summary.defensesResisted'),
        value: scan.attacksDefended ?? scan.protectionsResisted ?? 0,
        tone: 'neutral',
      },
      {
        label: this.intl.t('offensiveSecurity.summary.businessRisksConfirmed'),
        value: this.businessRisksConfirmed,
        tone: 'neutral',
      },
    ];
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
