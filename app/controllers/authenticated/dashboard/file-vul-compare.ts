import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import AnalysisModel from 'irene/models/analysis';
import type FileModel from 'irene/models/file';
import type VulnerabilityModel from 'irene/models/vulnerability';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardFileVulCompare extends Controller {
  @service declare intl: IntlService;

  declare model: {
    file1: FileModel;
    file2: FileModel;
    vulnerability: VulnerabilityModel;
    file1Analyses: AnalysisModel[];
    file2Analyses: AnalysisModel[];
  };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const { file1, file2, vulnerability } = this.model;
    const filesModel = `${file1?.id}...${file2?.id}`;

    return {
      title: this.intl.t('testCase'),
      route: 'authenticated.dashboard.file-vul-compare',
      models: [filesModel, vulnerability?.get?.('id')],
      routeGroup: 'project/files',

      parentCrumb: {
        routeGroup: 'project/files',
        title: this.intl.t('allProjects'),
        route: 'authenticated.dashboard.projects',
      },

      fallbackCrumbs: [
        {
          route: 'authenticated.dashboard.projects',
          title: this.intl.t('allProjects'),
        },
        {
          route: 'authenticated.dashboard.file',
          title: `${this.intl.t('scanDetails')}`,
          models: [file1?.id],
        },
        {
          route: 'authenticated.dashboard.choose',
          title: this.intl.t('fileCompare.fileSelection'),
          models: [file1?.id],
        },
        {
          route: 'authenticated.dashboard.compare.index',
          title: this.intl.t('compare'),
          models: [filesModel],
        },
        {
          route: 'authenticated.dashboard.file-vul-compare',
          title: this.intl.t('testCase'),
          models: [filesModel, vulnerability.get('id')],
        },
      ],
    };
  }
}
