import Component from '@glimmer/component';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type { AsyncBelongsTo } from '@ember-data/model';

import type ProxySettingModel from 'irene/models/proxy-setting';
import type ProfileModel from 'irene/models/profile';
import type ProjectModel from 'irene/models/project';
import parseError from 'irene/utils/parse-error';

export interface FileDetailsDynamicScanDrawerOldProxySettingsViewSignature {
  Args: {
    profile: AsyncBelongsTo<ProfileModel>;
    project: AsyncBelongsTo<ProjectModel>;
  };
}

export default class FileDetailsDynamicScanDrawerOldProxySettingsViewComponent extends Component<FileDetailsDynamicScanDrawerOldProxySettingsViewSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked proxy?: ProxySettingModel;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanDrawerOldProxySettingsViewSignature['Args']
  ) {
    super(owner, args);

    this.fetchProxySetting.perform();
  }

  get projectId() {
    return this.args.project.get('id');
  }

  fetchProxySetting = task(async () => {
    try {
      const profileId = this.args.profile.get('id');

      if (profileId) {
        this.proxy = await this.store.findRecord('proxy-setting', profileId);
      }
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('somethingWentWrong')));
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

      const analyticsData = enabled
        ? ENV.csb['enableProxy']
        : ENV.csb['disableProxy'];

      triggerAnalytics('feature', analyticsData as CsbAnalyticsFeatureData);
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::DrawerOld::ProxySettingsView': typeof FileDetailsDynamicScanDrawerOldProxySettingsViewComponent;
  }
}
