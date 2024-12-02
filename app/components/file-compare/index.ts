import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';
import { tracked } from '@glimmer/tracking';

import FileModel from 'irene/models/file';
import UnknownAnalysisStatusModel from 'irene/models/unknown-analysis-status';
import AkBreadcrumbsService from 'irene/services/ak-breadcrumbs';
import { scrollDashboardMainContainerTo } from 'irene/utils/scroll-to-top';

import {
  compareFiles,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

interface FileCompareSignature {
  Args: {
    file1: FileModel | null;
    file2: FileModel | null;
    unknownAnalysisStatus: UnknownAnalysisStatusModel | null;
  };
}

export default class FileCompareComponent extends Component<FileCompareSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('ak-breadcrumbs') declare breadcrumbsService: AkBreadcrumbsService;

  @tracked expandFilesOverview = false;

  get file1() {
    return this.args.file1;
  }

  get file2() {
    return this.args.file2;
  }

  get unknownAnalysisStatus() {
    return this.args.unknownAnalysisStatus;
  }

  get comparisons() {
    return compareFiles(this.file1, this.file2);
  }

  get tabItems() {
    const fileCompareCategories = getFileComparisonCategories(this.comparisons);

    return [
      {
        id: 'recurring-issues',
        route: 'authenticated.dashboard.compare.index',
        label: this.intl.t('fileCompare.recurringIssues'),
        badgeCount: fileCompareCategories.recurring.length,
      },
      {
        id: 'new-issues',
        route: 'authenticated.dashboard.compare.new-issues',
        label: this.intl.t('fileCompare.newIssues'),
        badgeCount: fileCompareCategories.newRisks.length,
      },
      {
        id: 'resolved-issues',
        route: 'authenticated.dashboard.compare.resolved-test-cases',
        label: this.intl.t('fileCompare.resolvedIssues'),
        badgeCount: fileCompareCategories.resolved.length,
      },
      this.unknownAnalysisStatus?.status
        ? {
            id: 'untested-cases',
            route: 'authenticated.dashboard.compare.untested-cases',
            label: this.intl.t('untested'),
            badgeCount: fileCompareCategories.untested.length,
          }
        : null,
    ].filter(Boolean);
  }

  get isAllUploadsBreadcrumb() {
    return this.breadcrumbsService.breadcrumbItems.find((it) =>
      it.route?.includes('authenticated.dashboard.project.files')
    );
  }

  @action
  goToCompareSelect() {
    if (this.isAllUploadsBreadcrumb) {
      this.router.transitionTo(
        'authenticated.dashboard.project.files',
        String(this.file1?.project?.get('id'))
      );

      return;
    }

    this.router.transitionTo(
      'authenticated.dashboard.choose',
      String(this.file1?.id)
    );
  }

  @action
  handleExpandFilesOverview() {
    this.expandFilesOverview = !this.expandFilesOverview;

    scrollDashboardMainContainerTo({ top: 0, behavior: 'smooth' });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileCompare: typeof FileCompareComponent;
  }
}
