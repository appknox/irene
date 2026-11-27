import Component from '@glimmer/component';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import { keptFindings } from 'irene/utils/offsec-goal-verdict';
import { CVSS_BANDS, type CvssBand } from 'irene/utils/offsec-cvss';
import type OffsecScanModel from 'irene/models/offsec-scan';
import type { OffsecScanArtifact } from 'irene/models/offsec-scan';

export interface SeverityCount {
  band: CvssBand;
  count: number;
}

export interface SummaryStat {
  label: string;
  value: number;
  tone: 'neutral' | 'exploited';
  breakdown?: SeverityCount[];
  caption?: string;
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

  /** Findings across goals, counting only those the reviewer kept; the API's own count includes false positives. */
  get businessRisksConfirmed(): number {
    return (this.args.scan.pentestGoals ?? []).reduce(
      (total, goal) =>
        total +
        (goal.findings
          ? keptFindings(goal.findings).length
          : (goal.findings_count ?? 0)),
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
      this.findingsStat,
    ];
  }

  get isScored(): boolean {
    return typeof this.args.scan.maxCvss === 'number';
  }

  /** The audit counts a value found by two goals once, so this can be lower than the per-goal sum. */
  get findingsStat(): SummaryStat {
    const scoring = this.args.scan.cvssScoring ?? {};

    if (!this.isScored || scoring.distinct_scored_findings === undefined) {
      return {
        label: this.intl.t('offensiveSecurity.summary.businessRisksConfirmed'),
        value: this.businessRisksConfirmed,
        tone: 'neutral',
      };
    }

    const counts = scoring.count_by_cvss_severity ?? {};

    return {
      label: this.intl.t('findings'),
      value: scoring.distinct_scored_findings,
      tone: 'neutral',
      breakdown: CVSS_BANDS.map((band) => ({
        band,
        count: counts[capitalize(band)] ?? 0,
      })).filter(({ count }) => count > 0),
      caption:
        scoring.all_findings_audited === false
          ? this.intl.t('offensiveSecurity.summary.auditIncomplete')
          : undefined,
    };
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
