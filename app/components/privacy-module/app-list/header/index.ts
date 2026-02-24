import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import ENUMS from 'irene/enums';
import styles from './index.scss';
import parseError from 'irene/utils/parse-error';
import type { PrivacyModuleAppListQueryParam } from 'irene/routes/authenticated/dashboard/privacy-module/index';
import type PrivacyModuleService from 'irene/services/privacy-module';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

interface PlatformObject {
  key: string;
  value: number;
}

type TabItem = {
  id: string;
  label: string;
  component: string;
};

export interface PrivacyModuleAppListHeaderSignature {
  Args: {
    queryParams: PrivacyModuleAppListQueryParam;
  };
}

export default class PrivacyModuleAppListHeaderComponent extends Component<PrivacyModuleAppListHeaderSignature> {
  @service declare privacyModule: PrivacyModuleService;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked openPrivacySettingsDrawer = false;
  @tracked selectedTab: string | null = null;
  @tracked piiEnabled = true;
  @tracked showConfirmation = false;
  @tracked pendingTab: string | null = null;
  @tracked searchQuery = '';

  constructor(
    owner: unknown,
    args: PrivacyModuleAppListHeaderSignature['Args']
  ) {
    super(owner, args);

    this.fetchOrganizationAiFeatures.perform();

    this.searchQuery = this.args.queryParams.app_query ?? '';
  }

  get tabItems() {
    return [
      this.piiEnabled && {
        id: 'pii',
        label: this.intl.t('privacyModule.pii'),
        component: 'privacy-module/settings/pii' as const,
      },
      {
        id: 'server-location',
        label: this.intl.t('privacyModule.serverLocation'),
        component: 'privacy-module/settings/server-location' as const,
      },
    ].filter(Boolean) as TabItem[];
  }

  get activeTabComponent() {
    return this.tabItems.find((t) => t.id === this.selectedTab)?.component;
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get platform() {
    return this.args.queryParams.app_platform;
  }

  get platformObjects() {
    return [
      {
        key: this.intl.t('all'),
        value: -1,
      },
      {
        key: this.intl.t('android'),
        value: ENUMS.PLATFORM.ANDROID,
      },
      {
        key: this.intl.t('iOS'),
        value: ENUMS.PLATFORM.IOS,
      },
    ];
  }

  get selectedPlatform() {
    const platformValue = Number(this.platform ?? -1);

    return (
      this.platformObjects.find((po) => po.value === platformValue) ??
      this.platformObjects[0]
    );
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
    return this.platform && Number(this.platform) !== -1;
  }

  get drawerTitle() {
    return this.showConfirmation
      ? this.intl.t('confirmation')
      : this.intl.t('privacyModule.settings');
  }

  get confirmationTitle() {
    let tabLabel = this.intl.t('privacyModule.serverLocation');

    if (this.selectedTab === 'pii') {
      tabLabel = this.intl.t('privacyModule.pii');
    }

    const message = this.intl.t('privacyModule.unsavedChanges', {
      tab: tabLabel,
    });

    return htmlSafe(message);
  }

  get isOwner() {
    return !!this.me.org?.is_owner;
  }

  @action
  handleSettingsDrawerOpen() {
    this.openPrivacySettingsDrawer = true;
  }

  @action
  handleSettingsDrawerClose() {
    this.openPrivacySettingsDrawer = false;
    this.showConfirmation = false;
    this.selectedTab = this.piiEnabled ? 'pii' : 'server-location';
    this.pendingTab = null;
    this.privacyModule.updatedSettings = {};
  }

  @action
  handleTabClick(id: string | number) {
    const nextTab = id as string;

    const hasChanges =
      Object.keys(this.privacyModule.updatedSettings || {}).length > 0;

    if (hasChanges) {
      this.pendingTab = nextTab;
      this.showConfirmation = true;
      return;
    }

    this.selectedTab = nextTab;
  }

  @action
  confirmTabSwitch() {
    if (this.pendingTab) {
      this.selectedTab = this.pendingTab;
    }

    this.privacyModule.updatedSettings = {};
    this.pendingTab = null;
    this.showConfirmation = false;
  }

  @action
  cancelTabSwitch() {
    this.pendingTab = null;
    this.showConfirmation = false;
  }

  @action
  onSearchQueryChange(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    this.searchQuery = query;

    debounceTask(this, 'setSearchQuery', query, 500);
  }

  @action
  handleClear() {
    this.searchQuery = '';

    this.privacyModule.fetchPrivacyProjects.perform(
      this.limit,
      0,
      '',
      this.platform
    );
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.privacyModule.fetchPrivacyProjects.perform(
      this.limit,
      0,
      query,
      this.platform
    );
  }

  @action filterPlatformChange(platform: PlatformObject) {
    this.privacyModule.fetchPrivacyProjects.perform(
      this.limit,
      0,
      this.searchQuery,
      platform.value
    );
  }

  @action clearFilters() {
    this.privacyModule.fetchPrivacyProjects.perform(
      this.limit,
      0,
      this.searchQuery,
      -1
    );
  }

  fetchOrganizationAiFeatures = task(async () => {
    try {
      const aiFeatures = await this.store.queryRecord(
        'organization-ai-feature',
        {}
      );

      if (this.organization.selected?.aiFeatures?.pii && aiFeatures.pii) {
        this.piiEnabled = true;
      } else {
        this.piiEnabled = false;
      }

      this.selectedTab = this.piiEnabled ? 'pii' : 'server-location';
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Header': typeof PrivacyModuleAppListHeaderComponent;
  }
}
