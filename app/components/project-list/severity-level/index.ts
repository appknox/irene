import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import type LoggerService from 'irene/services/logger';
import type ProjectModel from 'irene/models/project';
import type FileRiskModel from 'irene/models/file-risk';

interface ProjectListSeverityLevelSignature {
  Element: HTMLElement;
  Args: {
    project: ProjectModel;
  };
}

export default class ProjectListSeverityLevelComponent extends Component<ProjectListSeverityLevelSignature> {
  @service declare intl: IntlService;
  @service declare logger: LoggerService;

  @tracked fileRisk: FileRiskModel | null = null;

  constructor(owner: unknown, args: ProjectListSeverityLevelSignature['Args']) {
    super(owner, args);

    this.fetchFileRisk.perform();
  }

  get file() {
    return this.args.project.get('lastFile');
  }

  get showUnknownAnalysis() {
    return this.file?.get('project')?.get('showUnknownAnalysis');
  }

  get overridenPassedRiskCount() {
    return this.fileRisk?.get('overriddenPassedRiskCount') || 0;
  }

  get hasOverridenPassedRisks() {
    return this.overridenPassedRiskCount > 0;
  }

  get isLoadingFileRisk() {
    return this.fetchFileRisk.isRunning;
  }

  get severityLevelCounts() {
    const severityCountObjects = [
      {
        value: this.fileRisk?.get('riskCountCritical'),
        name: this.intl.t('critical'),
        severityType: 'critical',
      },
      {
        value: this.fileRisk?.get('riskCountHigh'),
        name: this.intl.t('high'),
        severityType: 'high',
      },
      {
        value: this.fileRisk?.get('riskCountMedium'),
        name: this.intl.t('medium'),
        severityType: 'medium',
      },
      {
        value: this.fileRisk?.get('riskCountLow'),
        name: this.intl.t('low'),
        severityType: 'low',
      },
      {
        value: this.fileRisk?.get('riskCountPassed'),
        name: this.intl.t('passed'),
        severityType: 'passed',
        hasOverridenPassedRisks: this.hasOverridenPassedRisks,
      },
    ];

    if (this.showUnknownAnalysis) {
      severityCountObjects.push({
        value: this.fileRisk?.get('riskCountUnknown'),
        name: this.intl.t('untested'),
        severityType: 'none',
      });
    }

    return severityCountObjects;
  }

  fetchFileRisk = task(async () => {
    try {
      if (this.file) {
        this.fileRisk = await waitForPromise(this.file.fetchFileRisk());
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch file risk for file - ${this.file?.id}`,
        error
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::SeverityLevel': typeof ProjectListSeverityLevelComponent;
  }
}
