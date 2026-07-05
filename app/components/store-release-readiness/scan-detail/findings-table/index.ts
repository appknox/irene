import Component from '@glimmer/component';
import type StoreReleaseScanModel from 'irene/models/store-release-scan';
import type StoreReleaseFindingModel from 'irene/models/store-release-finding';

interface FindingsTableSignature {
  Args: {
    scan: StoreReleaseScanModel;
    groupBy: 'category' | 'status';
  };
}

export default class FindingsTableComponent extends Component<FindingsTableSignature> {
  get groupedFindings() {
    const findings = this.args.scan.findings || [];

    if (this.args.groupBy === 'category') {
      return this.groupByCategory(findings);
    } else {
      return this.groupByStatus(findings);
    }
  }

  get hasFindings() {
    return Object.keys(this.groupedFindings).length > 0;
  }

  private groupByCategory(
    findings: StoreReleaseFindingModel[]
  ): Record<string, StoreReleaseFindingModel[]> {
    return findings.reduce(
      (acc, finding) => {
        const category = finding.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(finding);
        return acc;
      },
      {} as Record<string, StoreReleaseFindingModel[]>
    );
  }

  private groupByStatus(
    findings: StoreReleaseFindingModel[]
  ): Record<string, StoreReleaseFindingModel[]> {
    return findings.reduce(
      (acc, finding) => {
        let status = 'Untested';
        if (finding.passed) {
          status = 'Passed';
        } else if (finding.severity === 'BLOCKER') {
          status = 'Blocker';
        } else if (finding.severity === 'WARNING') {
          status = 'Warning';
        }

        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(finding);
        return acc;
      },
      {} as Record<string, StoreReleaseFindingModel[]>
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanDetail::FindingsTable': typeof FindingsTableComponent;
  }
}
