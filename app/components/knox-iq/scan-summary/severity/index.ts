import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type { AkProgressBarSegment } from 'irene/components/ak-progress-bar';
import type FileModel from 'irene/models/file';
import type FileRiskModel from 'irene/models/file-risk';

interface SeverityItem {
  key: string;
  label: string;
  count: number;
  color: string;
}

interface KnoxIqScanSummarySeveritySignature {
  Element: HTMLDivElement;
  Args: {
    file: FileModel;
  };
}

export default class KnoxIqScanSummarySeverityComponent extends Component<KnoxIqScanSummarySeveritySignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked fileRisk: FileRiskModel | null = null;

  constructor(
    owner: unknown,
    args: KnoxIqScanSummarySeveritySignature['Args']
  ) {
    super(owner, args);

    this.fetchFileRisk.perform();
  }

  get isFetchingFileRisk() {
    return this.fetchFileRisk.isRunning;
  }

  get overridenPassedRiskCount() {
    return this.fileRisk?.overriddenPassedRiskCount ?? 0;
  }

  get hasOverridenPassedRisks() {
    return this.overridenPassedRiskCount > 0;
  }

  get severityItems(): SeverityItem[] {
    return [
      {
        key: 'critical',
        label: this.intl.t('critical'),
        count: this.fileRisk?.riskCountCritical ?? 0,
        color: this.getCssVar('--severity-critical'),
      },
      {
        key: 'high',
        label: this.intl.t('high'),
        count: this.fileRisk?.riskCountHigh ?? 0,
        color: this.getCssVar('--severity-high'),
      },
      {
        key: 'medium',
        label: this.intl.t('medium'),
        count: this.fileRisk?.riskCountMedium ?? 0,
        color: this.getCssVar('--severity-medium'),
      },
      {
        key: 'low',
        label: this.intl.t('low'),
        count: this.fileRisk?.riskCountLow ?? 0,
        color: this.getCssVar('--severity-low'),
      },
      {
        key: 'passed',
        label: this.intl.t('passed'),
        count: this.fileRisk?.riskCountPassed ?? 0,
        color: this.getCssVar('--severity-passed'),
      },
      this.showUnknownAnalysis && {
        key: 'unknown',
        label: this.intl.t('untested'),
        count: this.fileRisk?.riskCountUnknown ?? 0,
        color: this.getCssVar('--severity-none'),
      },
    ].filter(Boolean) as SeverityItem[];
  }

  get showUnknownAnalysis() {
    return this.args.file?.get('project')?.get('showUnknownAnalysis');
  }

  get severityColumns(): { top: SeverityItem; bottom?: SeverityItem }[] {
    return [
      { top: this.severityItem('critical'), bottom: this.severityItem('low') },
      { top: this.severityItem('high'), bottom: this.severityItem('passed') },
      {
        top: this.severityItem('medium'),
        ...(this.showUnknownAnalysis && {
          bottom: this.severityItem('unknown'),
        }),
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

  @action
  severityItem(key: SeverityItem['key']) {
    return this.severityItems.find((item) => item.key === key)!;
  }

  @action
  getCssVar(name: string) {
    return getComputedStyle(document.body).getPropertyValue(name);
  }

  @action
  formatCount(value: number) {
    return value === 0 ? '0' : String(value).padStart(2, '0');
  }

  fetchFileRisk = task(async () => {
    try {
      this.fileRisk = await waitForPromise(this.args.file.fetchFileRisk());
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::ScanSummary::Severity': typeof KnoxIqScanSummarySeverityComponent;
  }
}
