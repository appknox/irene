import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type { AkProgressBarSegment } from 'irene/components/ak-progress-bar';
import type FileModel from 'irene/models/file';
import type FileExploitabilityModel from 'irene/models/file-exploitability';
import type FileRiskModel from 'irene/models/file-risk';

interface SeverityItem {
  key: string;
  label: string;
  count: number;
  color: string;
}

interface KnoxIqScanSummarySignature {
  Element: HTMLDivElement;
  Args: {
    file: FileModel;
    hasAnyKnoxiqScanCompleted?: boolean;
  };
}

export default class KnoxIqScanSummaryComponent extends Component<KnoxIqScanSummarySignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked previousFile: FileModel | null = null;
  @tracked fileRisk: FileRiskModel | null = null;
  @tracked fileExploitability: FileExploitabilityModel | null = null;

  get scanSummaryAccentClass() {
    return this.args.hasAnyKnoxiqScanCompleted
      ? 'scan-summary-accent-done'
      : 'scan-summary-accent-pending';
  }

  constructor(owner: unknown, args: KnoxIqScanSummarySignature['Args']) {
    super(owner, args);

    this.fetchPreviousFile.perform();
    this.fetchFileRisk.perform();
    this.fetchFileExploitability.perform();
  }

  get compareRouteModel() {
    //ToDo: Uncomment this when compare with knoxiq is implemented
    // if (!this.previousFile) {
    //   return null;
    // }
    // return `${this.args.file.id}...${this.previousFile?.id}`;
    return false;
  }

  get isFetchingFileRisk() {
    return this.fetchFileRisk.isRunning;
  }

  get isFetchingFileExploitability() {
    return this.fetchFileExploitability.isRunning;
  }

  get severityItems(): SeverityItem[] {
    const items: SeverityItem[] = [
      {
        key: 'critical',
        label: this.intl.t('critical'),
        count: this.fileRisk?.riskCountCritical ?? 0,
        color: 'var(--severity-critical)',
      },
      {
        key: 'high',
        label: this.intl.t('high'),
        count: this.fileRisk?.riskCountHigh ?? 0,
        color: 'var(--severity-high)',
      },
      {
        key: 'medium',
        label: this.intl.t('medium'),
        count: this.fileRisk?.riskCountMedium ?? 0,
        color: 'var(--severity-medium)',
      },
      {
        key: 'low',
        label: this.intl.t('low'),
        count: this.fileRisk?.riskCountLow ?? 0,
        color: 'var(--severity-low)',
      },
      {
        key: 'passed',
        label: this.intl.t('passed'),
        count: this.fileRisk?.riskCountPassed ?? 0,
        color: 'var(--severity-passed)',
      },
      {
        key: 'unknown',
        label: this.intl.t('untested'),
        count: this.fileRisk?.riskCountUnknown ?? 0,
        color: 'var(--severity-none)',
      },
    ];

    return items;
  }

  severityItem(key: SeverityItem['key']) {
    return this.severityItems.find((item) => item.key === key)!;
  }

  get severityColumns(): { top: SeverityItem; bottom: SeverityItem }[] {
    return [
      { top: this.severityItem('critical'), bottom: this.severityItem('low') },
      { top: this.severityItem('high'), bottom: this.severityItem('passed') },
      {
        top: this.severityItem('medium'),
        bottom: this.severityItem('unknown'),
      },
    ];
  }

  get severitySegments(): AkProgressBarSegment[] {
    return this.severityItems.map((item) => ({
      key: item.key,
      count: item.count,
      background: item.color,
    }));
  }

  get overridenPassedRiskCount() {
    return this.fileRisk?.overriddenPassedRiskCount ?? 0;
  }

  get hasOverridenPassedRisks() {
    return this.overridenPassedRiskCount > 0;
  }

  formatCount(value: number) {
    return value === 0 ? '0' : String(value).padStart(2, '0');
  }

  get displayHigh() {
    return this.formatCount(
      this.fileExploitability?.exploitabilityCountHigh ?? 0
    );
  }

  get displayMedium() {
    return this.formatCount(
      this.fileExploitability?.exploitabilityCountMedium ?? 0
    );
  }

  get displayLow() {
    return this.formatCount(
      this.fileExploitability?.exploitabilityCountLow ?? 0
    );
  }

  fetchPreviousFile = task(async () => {
    this.previousFile = await waitForPromise(
      this.args.file.fetchPreviousFile()
    );
  });

  fetchFileRisk = task(async () => {
    try {
      this.fileRisk = await waitForPromise(this.args.file.fetchFileRisk());
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  fetchFileExploitability = task(async () => {
    try {
      this.fileExploitability = await waitForPromise(
        this.args.file.fetchFileExploitability()
      );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::ScanSummary': typeof KnoxIqScanSummaryComponent;
  }
}
