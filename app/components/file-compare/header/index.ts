import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import RouterService from '@ember/routing/router-service';
import IntlService from 'ember-intl/services/intl';

import FileModel from 'irene/models/file';
import { AkBreadcrumbsItemSignature } from 'irene/components/ak-breadcrumbs/item';
import ProjectModel from 'irene/models/project';

interface FileCompareHeaderSignature {
  Element: HTMLElement;
  Args: {
    file1: FileModel | null;
    file2?: FileModel | null;
    project?: ProjectModel | null;
    expandFilesOverview?: boolean;
  };
  Blocks: {
    default: [];
    breadcrumbs: [];
    file2Content: [];
    file1Content: [];
    header: [];
    headerCTA: [];
  };
}

export default class FileCompareHeaderComponent extends Component<FileCompareHeaderSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;

  get file1() {
    return this.args.file1;
  }

  get file2() {
    return this.args.file2;
  }

  get platformIconClass() {
    return (
      this.args.project?.get('platformIconClass') ||
      this.file1?.project.get('platformIconClass')
    );
  }

  get breadcrumbItems(): AkBreadcrumbsItemSignature['Args'][] {
    return [
      {
        route: 'authenticated.dashboard.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      {
        route: 'authenticated.dashboard.file',
        linkTitle: this.intl.t('scanDetails'),
        model: this.file1?.id,
      },
      {
        route: 'authenticated.dashboard.compare',
        linkTitle: this.intl.t('compare'),
        model: `${this.file1?.id}...${this.file2?.id}`,
      },
    ];
  }

  @action goToSettings() {
    this.router.transitionTo(
      'authenticated.dashboard.project.settings',
      String(this.args.project?.get('id'))
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::Header': typeof FileCompareHeaderComponent;
  }
}
