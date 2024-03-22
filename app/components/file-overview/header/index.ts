import { action } from '@ember/object';
import Component from '@glimmer/component';
import FileModel from 'irene/models/file';
import styles from './index.scss';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import { inject as service } from '@ember/service';

interface FileOverviewHeaderSignature {
  Args: {
    file: FileModel | null;
    isSelectedFile?: boolean;
    disableSelection?: boolean;
    onFileSelect?: (file: FileModel | null) => void;
    hideCTAs?: boolean;
    hideOpenInNewTabIcon?: boolean;
    showMenuButton?: boolean;
  };
}

interface FileMoreMenuItem {
  group?: string;
  label: string;
  iconName: string;
  route: string;
  routeModel: string | undefined;
  hideDivider?: boolean;
}

export default class FileOverviewHeaderComponent extends Component<FileOverviewHeaderSignature> {
  @service declare intl: IntlService;

  @tracked fileMoreMenuRef: HTMLElement | null = null;

  get file() {
    return this.args.file;
  }

  get packageName() {
    return this.args.file?.project.get('packageName');
  }

  @action handleFileSelect(event: Event) {
    event.stopPropagation();
    this.args.onFileSelect?.(this.args.file);
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

  get fileMoreMenuList() {
    const hasMultipleFiles = this.args.file?.project.get('hasMultipleFiles');

    return [
      hasMultipleFiles && {
        group: this.intl.t('fileLevel'),
        label: this.intl.t('compare'),
        iconName: 'compare-arrows',
        route: 'authenticated.dashboard.choose',
        routeModel: this.file?.id,
      },
      hasMultipleFiles && {
        group: this.intl.t('projectLevel'),
        label: this.intl.t('allUploads'),
        iconName: 'apps',
        route: 'authenticated.dashboard.project.files',
        routeModel: this.args.file?.project.get('id'),
      },
      {
        label: this.intl.t('settings'),
        iconName: 'settings',
        route: 'authenticated.dashboard.project.settings',
        routeModel: this.args.file?.project.get('id'),
        hideDivider: true,
      },
    ].filter(Boolean) as FileMoreMenuItem[];
  }

  get openInNewTabLinkClass() {
    return styles['open-in-new-tab-link-class'];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileOverview::Header': typeof FileOverviewHeaderComponent;
  }
}
