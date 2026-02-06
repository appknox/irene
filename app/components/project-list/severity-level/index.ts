import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import type LoggerService from 'irene/services/logger';
import type ProjectModel from 'irene/models/project';
import type ProjectService from 'irene/services/project';

interface ProjectListSeverityLevelSignature {
  Element: HTMLElement;
  Args: {
    project: ProjectModel;
  };
}

export default class ProjectListSeverityLevelComponent extends Component<ProjectListSeverityLevelSignature> {
  @service declare intl: IntlService;
  @service declare logger: LoggerService;
  @service declare project: ProjectService;

  get file() {
    return this.args.project.get('lastFile');
  }

  get fileRisk() {
    if (!this.file) {
      return null;
    }

    return this.project.risksByFileId.get(this.file.id);
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
    return this.project.fetchRisks.isRunning;
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::SeverityLevel': typeof ProjectListSeverityLevelComponent;
  }
}
