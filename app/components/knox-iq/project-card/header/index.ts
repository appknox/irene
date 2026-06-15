import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import styles from './index.scss';
import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';

interface FileMoreMenuItem {
  group?: string;
  label: string;
  iconName: 'compare-arrows' | 'apps' | 'settings';
  route: string;
  routeModel: string | undefined;
  hideDivider?: boolean;
}

interface KnoxIqProjectCardHeaderSignature {
  Args: {
    file: FileModel | null;
    project?: ProjectModel | null;
    isLegacy?: boolean;
    isSelectedFile?: boolean;
    showCheckbox?: boolean;
    disableCheckbox?: boolean;
    onFileSelect?: (file: FileModel | null) => void;
    showMenuButton?: boolean;
    showRunKnoxIq?: boolean;
    onRunKnoxIq?: () => void;
    showOpenInNewTab?: boolean;
  };
}

export default class KnoxIqProjectCardHeaderComponent extends Component<KnoxIqProjectCardHeaderSignature> {
  @service declare intl: IntlService;

  @tracked fileMoreMenuRef: HTMLElement | null = null;

  get packageName() {
    return this.args.project?.packageName;
  }

  @action
  handleFileSelect(event: Event) {
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

  @action
  handleRunKnoxIq(event: MouseEvent) {
    event.stopPropagation();
    this.args.onRunKnoxIq?.();
  }

  @action
  handleOpenInNewTab(event: MouseEvent) {
    event.stopPropagation();
  }

  get fileMoreMenuList() {
    if (!this.fileMoreMenuRef) {
      return [];
    }

    const project = this.args.project;
    const hasMultipleFiles = project?.hasMultipleFiles;

    return [
      this.args.isLegacy &&
        hasMultipleFiles && {
          group: this.intl.t('fileLevel'),
          label: this.intl.t('compare'),
          iconName: 'compare-arrows',
          route: 'authenticated.dashboard.choose',
          routeModel: this.args.file?.id,
        },
      hasMultipleFiles && {
        group: this.intl.t('projectLevel'),
        label: this.intl.t('allUploads'),
        iconName: 'apps',
        route: 'authenticated.dashboard.project.files',
        routeModel: project?.id,
      },
      {
        label: this.intl.t('settings'),
        iconName: 'settings',
        route: 'authenticated.dashboard.project.settings',
        routeModel: project?.id,
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
    'KnoxIq::ProjectCard::Header': typeof KnoxIqProjectCardHeaderComponent;
  }
}
