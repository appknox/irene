import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import AmConfigurationModel from 'irene/models/amconfiguration';
import MeService from 'irene/services/me';
import OrganizationService from 'irene/services/organization';
import AppMonitoringService from 'irene/services/appmonitoring';

interface AppMonitoringSettingsSignature {
  Args: {
    settings: AmConfigurationModel | undefined;
  };
}

export default class AppMonitoringSettingsComponent extends Component<AppMonitoringSettingsSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare appmonitoring: AppMonitoringService;

  get canEditSettings() {
    return (
      this.me.org?.get('is_admin') &&
      this.organization.selectedOrgProjectsCount > 0
    );
  }

  toggleAppMonitoringEnabled = task(async (_, checked: boolean) => {
    const settings = this.args.settings;

    if (settings) {
      settings.set('enabled', checked);
      await settings.save();

      this.appmonitoring.reload();
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Settings': typeof AppMonitoringSettingsComponent;
  }
}
