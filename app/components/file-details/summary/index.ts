import { action } from '@ember/object';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';

export interface FileDetailsSummarySignature {
  Args: {
    file: FileModel;
  };
}

interface FileMoreMenuItem {
  group?: string;
  query?: Record<string, unknown>;
  label: string;
  iconName: 'settings' | 'compare-arrows' | 'apps';
  route: string;
  routeModel: string | undefined;
  hideDivider?: boolean;
}

export default class FileDetailsSummaryComponent extends Component<FileDetailsSummarySignature> {
  @service declare intl: IntlService;

  @tracked showMoreFileSummary = false;
  @tracked fileMoreMenuRef: HTMLElement | null = null;

  get packageName() {
    return this.args.file.project.get('packageName');
  }

  get fileMoreMenuList() {
    const hasMultipleFiles = this.args.file.project.get('hasMultipleFiles');

    return [
      hasMultipleFiles && {
        group: this.intl.t('fileLevel'),
        label: this.intl.t('compare'),
        iconName: 'compare-arrows',
        route: 'authenticated.dashboard.choose',
        routeModel: this.args.file.id,
      },
      hasMultipleFiles && {
        group: this.intl.t('projectLevel'),
        label: this.intl.t('allUploads'),
        iconName: 'apps',
        route: 'authenticated.dashboard.project.files',
        routeModel: this.args.file.project.get('id'),
      },
      {
        label: this.intl.t('settings'),
        iconName: 'settings',
        route: 'authenticated.dashboard.project.settings',
        routeModel: this.args.file.project.get('id'),
        hideDivider: true,
      },
    ].filter(Boolean) as FileMoreMenuItem[];
  }

  get fileSummary() {
    return [
      { label: this.intl.t('version'), value: this.args.file.version },
      {
        label: capitalize(this.intl.t('versionCode')),
        value: this.args.file.versionCode,
      },
      {
        label: this.intl.t('uploadedOn'),
        value: this.args.file.createdOnDateTime,
      },
    ];
  }

  @action
  handleFileMoreMenuOpen(event: MouseEvent) {
    this.fileMoreMenuRef = event.currentTarget as HTMLElement;
  }

  @action
  handleFileMoreMenuClose() {
    this.fileMoreMenuRef = null;
  }

  @action
  handleFileSummaryToggle() {
    this.showMoreFileSummary = !this.showMoreFileSummary;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Summary': typeof FileDetailsSummaryComponent;
  }
}
