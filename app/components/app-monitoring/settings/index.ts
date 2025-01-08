import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { debounceTask } from 'ember-lifeline';

import AmConfigurationModel from 'irene/models/amconfiguration';
import MeService from 'irene/services/me';
import OrganizationService from 'irene/services/organization';
import styles from './index.scss';
import AppMonitoringService from 'irene/services/appmonitoring';
import ENUMS from 'irene/enums';

interface AppMonitoringSettingsSignature {
  Args: {
    settings: AmConfigurationModel | undefined;
  };
}

interface PlatformObject {
  key: string;
  value: number;
}

export default class AppMonitoringSettingsComponent extends Component<AppMonitoringSettingsSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare appmonitoring: AppMonitoringService;
  @service declare router: RouterService;

  get selectedPlatform() {
    const platform = this.appmonitoring.platform;

    return platform
      ? this.platformObjects.find((po) => po.value === Number(platform))
      : {
          key: 'All',
          value: -1,
        };
  }

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

  get platformObjects() {
    return [
      {
        key: 'All',
        value: -1,
      },
      {
        key: 'Android',
        value: ENUMS.PLATFORM.ANDROID,
      },
      {
        key: 'iOS',
        value: ENUMS.PLATFORM.IOS,
      },
    ];
  }

  get dropDownClass() {
    return styles['filter-input-dropdown'];
  }

  get triggerClass() {
    return styles['filter-input'];
  }

  get clearFilterIconClass() {
    return styles['clear-filter-icon'];
  }

  get showClearFilter() {
    return this.appmonitoring.platform && this.appmonitoring.platform >= 0;
  }

  @action onSearchQueryChange(event: Event) {
    const query = (event.target as HTMLSelectElement).value;

    debounceTask(this, 'setSearchQuery', query, 500);
  }

  @action clearSearchInput() {
    this.setSearchQuery('');
  }

  setSearchQuery(query: string) {
    const searchQueryParam = query || null;

    this.router.transitionTo('authenticated.dashboard.app-monitoring', {
      queryParams: { app_offset: 0, app_query: searchQueryParam },
      merge: true,
    });
  }

  @action filterPlatform(platform: PlatformObject) {
    const platformQuery = platform.value >= 0 ? platform.value : null;

    this.router.transitionTo('authenticated.dashboard.app-monitoring', {
      queryParams: { app_offset: 0, app_platform: platformQuery },
      merge: true,
    });
  }

  @action clearFilters() {
    this.router.transitionTo('authenticated.dashboard.app-monitoring', {
      queryParams: { app_offset: 0, app_platform: null },
      merge: true,
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Settings': typeof AppMonitoringSettingsComponent;
  }
}
