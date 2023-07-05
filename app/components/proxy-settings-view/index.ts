import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';
import ProxySettingModel from 'irene/models/proxy-setting';
import { AsyncBelongsTo } from '@ember-data/model';
import ProfileModel from 'irene/models/profile';
import ProjectModel from 'irene/models/project';

export interface ProxySettingsViewSignature {
  Args: {
    profile: AsyncBelongsTo<ProfileModel>;
    project: AsyncBelongsTo<ProjectModel>;
  };
}

export default class ProxySettingsViewComponent extends Component<ProxySettingsViewSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked proxy?: ProxySettingModel;

  constructor(owner: unknown, args: ProxySettingsViewSignature['Args']) {
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

      if (enabled) {
        triggerAnalytics(
          'feature',
          ENV.csb['enableProxy'] as CsbAnalyticsFeatureData
        );
      } else {
        triggerAnalytics(
          'feature',
          ENV.csb['disableProxy'] as CsbAnalyticsFeatureData
        );
      }
    } catch (error) {
      const err = error as AdapterError;
      let errMsg = this.intl.t('plaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProxySettingsView: typeof ProxySettingsViewComponent;
  }
}
