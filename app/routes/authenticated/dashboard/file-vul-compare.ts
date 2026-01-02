import { service } from '@ember/service';
import { debug } from '@ember/debug';
import { action } from '@ember/object';
import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type FileModel from 'irene/models/file';
import type VulnerabilityModel from 'irene/models/vulnerability';

export interface FileVulCompareRouteQueryParams {
  files: string;
  vulnerability_id: string;
}

export interface FileVulCompareRouteModel {
  file1: FileModel;
  file2: FileModel;
  vulnerability: VulnerabilityModel;
  isInvalidCompare: boolean;
}

export default class AuthenticatedDashboardFileVulCompareRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;
  @service declare router: RouterService;

  @action
  error(error: AdapterError) {
    if (error?.errors && error.errors[0]?.status === '404') {
      this.router.transitionTo('/not-found');
    }
  }

  async model(
    params: FileVulCompareRouteQueryParams
  ): Promise<FileVulCompareRouteModel> {
    const { files, vulnerability_id } = params;
    const [file1Id, file2Id] = files.split('...');

    debug(
      `Comparing vulnerability with id - ${vulnerability_id} of files ${file1Id} and ${file2Id}`
    );

    const file1 = await this.store.findRecord('file', String(file1Id));
    const file2 = await this.store.findRecord('file', String(file2Id));
    const isSameFile = file1?.get('id') === file2?.get('id');

    const areOfDifferentProjects =
      file1?.project?.get('id') !== file2?.project?.get('id');

    const isInvalidCompare = areOfDifferentProjects || isSameFile;

    const vulnerability = await this.store.findRecord(
      'vulnerability',
      vulnerability_id
    );

    return {
      file1,
      file2,
      vulnerability,
      isInvalidCompare,
    };
  }
}
