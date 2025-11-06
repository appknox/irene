import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type ProjectModel from 'irene/models/project';

export interface ProjectListActionSignature {
  Args: {
    project: ProjectModel;
  };
}

interface FileMoreMenuItem {
  group?: string;
  label: string;
  iconName: 'compare-arrows' | 'apps' | 'settings';
  route: string;
  routeModel: string | undefined;
  hideDivider?: boolean;
}

export default class ProjectListActionComponent extends Component<ProjectListActionSignature> {
  @service declare intl: IntlService;

  @tracked fileMoreMenuRef: HTMLElement | null = null;

  get file() {
    return this.args.project.get('lastFile');
  }

  get iconUrl() {
    return this.args.project.get('lastFile')?.get('iconUrl');
  }

  get fileMoreMenuList() {
    const hasMultipleFiles = this.args.project.get('hasMultipleFiles');

    return [
      hasMultipleFiles && {
        group: this.intl.t('fileLevel'),
        label: this.intl.t('compare'),
        iconName: 'compare-arrows',
        route: 'authenticated.dashboard.choose',
        routeModel: this.file?.get('id'),
      },
      hasMultipleFiles && {
        group: this.intl.t('projectLevel'),
        label: this.intl.t('allUploads'),
        iconName: 'apps',
        route: 'authenticated.dashboard.project.files',
        routeModel: this.args.project.get('id'),
      },
      {
        label: this.intl.t('settings'),
        iconName: 'settings',
        route: 'authenticated.dashboard.project.settings',
        routeModel: this.args.project.get('id'),
        hideDivider: true,
      },
    ].filter(Boolean) as FileMoreMenuItem[];
  }

  @action
  handleFileMoreMenuOpen(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    this.fileMoreMenuRef = event.currentTarget as HTMLElement;
  }

  @action
  handleFileMoreMenuClose() {
    this.fileMoreMenuRef = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::Action': typeof ProjectListActionComponent;
  }
}
