import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';
import type { AsyncBelongsTo } from '@ember-data/model';

import parseError from 'irene/utils/parse-error';
import type AnalyticsService from 'irene/services/analytics';
import type ProxySettingModel from 'irene/models/proxy-setting';
import type ProfileModel from 'irene/models/profile';
import type ProjectModel from 'irene/models/project';

export interface FileDetailsProxySettingsSignature {
  Args: {
    profile: AsyncBelongsTo<ProfileModel>;
    project: AsyncBelongsTo<ProjectModel>;
  };
}

export default class FileDetailsProxySettingsComponent extends Component<FileDetailsProxySettingsSignature> {
  @service declare intl: IntlService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked proxy?: ProxySettingModel;

  constructor(owner: unknown, args: FileDetailsProxySettingsSignature['Args']) {
    super(owner, args);

    this.fetchProxySetting.perform();
  }

  get projectId() {
    return this.args.project.get('id');
  }

  fetchProxySetting = task(async () => {
    const profileId = this.args.profile.get('id');

    if (profileId) {
      this.proxy = await this.store.findRecord('proxy-setting', profileId);
    }
  });

  /* Proxy enable or disable */
  toggleProxy = task(async (event) => {
    try {
      const enabled = event.target.checked;

      this.proxy?.set('enabled', enabled);

      await this.proxy?.save();

      const statusText = enabled ? this.intl.t('on') : this.intl.t('off');

      this.notify.info(
        `${this.intl.t('proxyTurned')} ${statusText.toUpperCase()}`
      );

      this.analytics.track({
        name: 'PROXY_SETTINGS_CHANGE_EVENT',
        properties: {
          feature: enabled ? 'enable_proxy' : 'disable_proxy',
          project_id: this.projectId,
          action: enabled ? 'enabled' : 'disabled',
        },
      });
    } catch (error) {
      this.proxy?.rollbackAttributes();

      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ProxySettings': typeof FileDetailsProxySettingsComponent;
  }
}
