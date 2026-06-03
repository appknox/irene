import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';
import type FileRiskModel from 'irene/models/file-risk';
import type { AkProgressBarSegment } from 'irene/components/ak-progress-bar';

interface KnoxIqProjectCardSeveritySectionSignature {
  Element: HTMLDivElement;
  Args: {
    file: FileModel | null;
    project?: ProjectModel | null;
  };
}

export default class KnoxIqProjectCardSeveritySectionComponent extends Component<KnoxIqProjectCardSeveritySectionSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked fileRisk: FileRiskModel | null = null;

  constructor(
    owner: unknown,
    args: KnoxIqProjectCardSeveritySectionSignature['Args']
  ) {
    super(owner, args);

    this.fetchFileRisk.perform();
  }

  get isFetchingFileRisk() {
    return this.fetchFileRisk.isRunning;
  }

  get showUnknownAnalysis() {
    return this.args.project?.showUnknownAnalysis;
  }

  get overridenPassedRiskCount() {
    return this.fileRisk?.overriddenPassedRiskCount ?? 0;
  }

  get hasOverridenPassedRisks() {
    return this.overridenPassedRiskCount > 0;
  }

  get severityItems() {
    const items = [
      {
        key: 'critical',
        label: this.intl.t('critical'),
        count: this.fileRisk?.riskCountCritical ?? 0,
        color: 'var(--severity-critical)',
        hasOverridenPassedRisks: false,
      },
      {
        key: 'high',
        label: this.intl.t('high'),
        count: this.fileRisk?.riskCountHigh ?? 0,
        color: 'var(--severity-high)',
        hasOverridenPassedRisks: false,
      },
      {
        key: 'medium',
        label: this.intl.t('medium'),
        count: this.fileRisk?.riskCountMedium ?? 0,
        color: 'var(--severity-medium)',
        hasOverridenPassedRisks: false,
      },
      {
        key: 'low',
        label: this.intl.t('low'),
        count: this.fileRisk?.riskCountLow ?? 0,
        color: 'var(--severity-low)',
        hasOverridenPassedRisks: false,
      },
      {
        key: 'passed',
        label: this.intl.t('passed'),
        count: this.fileRisk?.riskCountPassed ?? 0,
        color: 'var(--severity-passed)',
        hasOverridenPassedRisks: this.hasOverridenPassedRisks,
      },
    ];

    if (this.showUnknownAnalysis) {
      items.push({
        key: 'unknown',
        label: this.intl.t('untested'),
        count: this.fileRisk?.riskCountUnknown ?? 0,
        color: 'var(--severity-none)',
        hasOverridenPassedRisks: false,
      });
    }

    return items;
  }

  get severitySegments(): AkProgressBarSegment[] {
    return this.severityItems.map((item) => ({
      key: item.key,
      count: item.count,
      background: item.color,
    }));
  }

  formatCount(value: number) {
    return value === 0 ? '0' : String(value).padStart(2, '0');
  }

  noop() {}

  fetchFileRisk = task(async () => {
    try {
      if (this.args.file) {
        this.fileRisk = await waitForPromise(this.args.file.fetchFileRisk());
      }
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::ProjectCard::SeveritySection': typeof KnoxIqProjectCardSeveritySectionComponent;
  }
}
