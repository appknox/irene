import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import ProjectModel from 'irene/models/project';
import ENUMS from 'irene/enums';

interface ProjectListSeverityLevelSignature {
  Element: HTMLElement;
  Args: {
    project: ProjectModel;
  };
}

export default class ProjectListSeverityLevelComponent extends Component<ProjectListSeverityLevelSignature> {
  @service declare intl: IntlService;

  get file() {
    return this.args.project.get('lastFile');
  }

  get showUnknownAnalysis() {
    return this.file?.get('project')?.get('showUnknownAnalysis');
  }

  get overridenPassedRiskCount() {
    return (
      this.file
        ?.get('analyses')
        ?.reduce(
          (count, a) =>
            a.isOverriddenAsPassed && a.status === ENUMS.ANALYSIS.COMPLETED
              ? count + 1
              : count,
          0
        ) || 0
    );
  }

  get hasOverridenPassedRisks() {
    return this.overridenPassedRiskCount > 0;
  }

  get severityLevelCounts() {
    const file = this.file;

    const severityCountObjects = [
      {
        value: file?.get('countRiskCritical'),
        name: this.intl.t('critical'),
        severityType: 'critical',
      },
      {
        value: file?.get('countRiskHigh'),
        name: this.intl.t('high'),
        severityType: 'high',
      },
      {
        value: file?.get('countRiskMedium'),
        name: this.intl.t('medium'),
        severityType: 'medium',
      },
      {
        value: file?.get('countRiskLow'),
        name: this.intl.t('low'),
        severityType: 'low',
      },
      {
        value: file?.get('countRiskNone'),
        name: this.intl.t('passed'),
        severityType: 'passed',
        hasOverridenPassedRisks: this.hasOverridenPassedRisks,
      },
    ];

    if (this.showUnknownAnalysis) {
      severityCountObjects.push({
        value: file?.get('countRiskUnknown'),
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
