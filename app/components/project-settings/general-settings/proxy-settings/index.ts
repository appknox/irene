import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, waitForProperty } from 'ember-concurrency';

import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import { BufferedChangeset } from 'ember-changeset/types';
import ENV from 'irene/config/environment';
import ProxySettingValidation from 'irene/validations/proxy-settings';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import Store from '@ember-data/store';
import ProfileModel from 'irene/models/profile';
import ProxySettingModel from 'irene/models/proxy-setting';
import IntlService from 'ember-intl/services/intl';

type ChangesetBufferProps = Partial<BufferedChangeset> & ProxySettingModel;

interface ProjectSettingsGeneralSettingsProxySettingsSignature {
  Args: {
    profile: ProfileModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsProxySettingsComponent extends Component<ProjectSettingsGeneralSettingsProxySettingsSignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked currentProxy: ProxySettingModel | null = null;
  @tracked changeset: ChangesetBufferProps | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsProxySettingsSignature['Args']
  ) {
    super(owner, args);

    this.syncSettings.perform();
  }

  get proxyId() {
    return this.args.profile?.id;
  }

  get hasProxyValues() {
    return (
      !!this.changeset?.host && !!this.changeset.port && this.changeset.isValid
    );
  }

  get tProxySettingsSaved() {
    return this.intl.t('proxySettingsSaved');
  }

  get tProxyTurned() {
    return this.intl.t('proxyTurned');
  }

  get tOn() {
    return this.intl.t('on');
  }

  get tOff() {
    return this.intl.t('off');
  }

  getCurrentProxy = task(async () => {
    try {
      await waitForProperty(this, 'args.profile.id', (pid) => !!pid);
      const proxyId = this.proxyId;
      const proxyRecord = await this.store.findRecord(
        'proxy-setting',
        String(proxyId)
      );

      this.currentProxy = proxyRecord;
    } catch (e) {
      return;
    }
  });

  syncSettings = task(async () => {
    await this.getCurrentProxy.perform();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const changeset = new Changeset(
      this.currentProxy as ProxySettingModel,
      lookupValidator(ProxySettingValidation),
      ProxySettingValidation
    ) as ChangesetBufferProps;

    this.changeset = changeset;
  });

  clearProxy = task(async () => {
    try {
      const currentProxy = this.currentProxy;

      await currentProxy?.destroyRecord();
      currentProxy?.unloadRecord();

      await this.syncSettings.perform();

      return false;
    } catch (e) {
      return;
    }
  });

  saveChanges = task(async () => {
    try {
      const changeset = this.changeset;
      await changeset?.validate?.();

      const isValid = changeset?.isValid;

      if (!isValid) {
        if (!(changeset?.host || changeset?.port)) {
          return await this.clearProxy.perform();
        }

        if (changeset.errors && changeset?.errors?.[0]?.validation) {
          this.notify.error(
            String(changeset.errors[0].validation[0]),
            ENV.notifications
          );
        }

        return false;
      }

      await changeset.save();

      return true;
    } catch (e) {
      return;
    }
  });

  saveProxy = task(async () => {
    try {
      const status = await this.saveChanges.perform();

      if (status) {
        this.notify.success(this.tProxySettingsSaved);

        triggerAnalytics(
          'feature',
          ENV.csb['changeProxySettings'] as CsbAnalyticsData
        );
      }
    } catch (e) {
      return;
    }
  });

  enableProxy = task(async (_: Event, checked: boolean) => {
    try {
      const changeset = this.changeset;

      if (changeset) {
        changeset['enabled'] = checked;

        const status = await this.saveChanges.perform();
        const statusText = changeset.enabled ? this.tOn : this.tOff;

        if (status) {
          this.notify.info(this.tProxyTurned + statusText.toUpperCase());

          if (checked) {
            triggerAnalytics(
              'feature',
              ENV.csb['enableProxy'] as CsbAnalyticsData
            );
          } else {
            triggerAnalytics(
              'feature',
              ENV.csb['disableProxy'] as CsbAnalyticsData
            );
          }
        } else {
          if (checked) {
            this.notify.error(String(changeset?.errors?.[0]?.validation?.[0]));
          }

          // event.preventDefault();
        }
      }
    } catch (e) {
      return;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::ProxySettings': typeof ProjectSettingsGeneralSettingsProxySettingsComponent;
  }
}
