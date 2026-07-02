import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type AnalysisModel from 'irene/models/analysis';

import type FileModel from 'irene/models/file';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import { tracked } from 'tracked-built-ins';

export default class AuthenticatedDashboardFile extends Controller {
  @service declare intl: IntlService;

  @tracked showLegacyMessage = true;

  declare model: {
    file: FileModel;
    profileId: number;
    fileAnalyses: AnalysisModel[];
  };

  get someAnalysesAreLegacyMessage() {
    return [
      {
        icon: 'warning',
        color: 'error-color' as const,
        message: this.intl.t('cvssLegacyMessage'),
      },
    ];
  }

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('scanDetails'),
      route: 'authenticated.dashboard.file',
      models: [this.model?.file?.id],
      routeGroup: 'project/files',

      parentCrumb: {
        title: this.intl.t('allProjects'),
        route: 'authenticated.dashboard.projects',
        routeGroup: 'project/files',
      },
    };
  }

  @action
  closeLegacyMessage() {
    this.showLegacyMessage = false;
  }
}
