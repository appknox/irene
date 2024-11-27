import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';
import { tracked } from '@glimmer/tracking';

import FileModel from 'irene/models/file';

import {
  compareFiles,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

import UnknownAnalysisStatusModel from 'irene/models/unknown-analysis-status';
import { scrollDashboardMainContainerTo } from 'irene/utils/scroll-to-top';

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

  @tracked expandFilesOverview = false;

  get file1() {
    return this.args.file1;
  }

  get file2() {
    return this.args.file2;
  }

  get isAllUploadsBreadcrumb() {
    return (
      this.router.currentRoute?.queryParams?.['referrer'] === 'all_uploads'
    );
  }

  get unknownAnalysisStatus() {
    return this.args.unknownAnalysisStatus;
  }

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.dashboard.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      this.isAllUploadsBreadcrumb
        ? {
            route: 'authenticated.dashboard.project.files',
            linkTitle: this.file1?.project?.get('packageName'),
            model: this.file1?.project?.get('id'),
          }
        : null,
      !this.isAllUploadsBreadcrumb
        ? {
            route: 'authenticated.dashboard.file',
            linkTitle: `${this.intl.t('scanDetails')}`,
            model: this.file1?.id,
          }
        : null,
      !this.isAllUploadsBreadcrumb
        ? {
            route: 'authenticated.dashboard.choose',
            linkTitle: this.intl.t('fileCompare.fileSelection'),
            model: this.file1?.id,
          }
        : null,
      {
        route: 'authenticated.dashboard.compare',
        linkTitle: this.intl.t('compare'),
        model: `${this.file1?.id}`,
      },
    ].filter(Boolean);
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
