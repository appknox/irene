import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type SkThirdPartyAppModel from 'irene/models/sk-third-party-app';

import styles from './index.scss';

interface Signature {
  Args: {
    app: SkThirdPartyAppModel;
    selectedVersion: string;
  };
}

export default class StoreknoxThirdPartyScansAppDetailsHeaderComponent extends Component<Signature> {
  @service declare router: RouterService;

  @tracked failedToLoadAppIcon = false;

  get displayFallbackIcon() {
    return !this.args.app?.iconUrl || this.failedToLoadAppIcon;
  }

  get versionTriggerClass() {
    return styles['version-trigger'];
  }

  get selectedVersion() {
    return this.args.selectedVersion || this.args.app?.version;
  }

  @action handleIconError() {
    this.failedToLoadAppIcon = true;
  }

  @action onVersionChange(version: string) {
    this.router.transitionTo({ queryParams: { tp_version: version } });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ThirdPartyScans::AppDetails::Header': typeof StoreknoxThirdPartyScansAppDetailsHeaderComponent;
  }
}
