import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type OrganizationService from 'irene/services/organization';
import type OrganizationAiFeatureModel from 'irene/models/organization-ai-feature';

type AiFeatureKey = 'reporting';

export default class OrganizationAiPoweredFeaturesComponent extends Component {
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked aiDrawerOpen = false;
  @tracked aiFeatures: OrganizationAiFeatureModel | null = null;
  @tracked drawerButtonLabel: string = '';
  @tracked featureToToggle: AiFeatureKey | null = null;
  @tracked targettedToggle: HTMLInputElement | null = null;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchOrganizationAiFeatures.perform();
  }

  get features() {
    return this.organization.selected?.aiFeatures;
  }

  get aiFeaturesList() {
    return [
      {
        featureKey: 'reporting' as const,
        isChecked: this.aiFeatures?.reporting,
        enabled: this.features?.reporting,
        label: this.intl.t('reporting'),
        description: this.intl.t('reportModule.settingsDesc'),
        header: this.intl.t('reportModule.settingsHeader'),

        isToggling:
          this.featureToToggle === 'reporting' &&
          this.toggleReporting.isRunning,
      },
    ];
  }

  get drawerInfo() {
    return [
      {
        title: this.intl.t('reportModule.aiDataAccess'),
        body: this.intl.t('reportModule.aiDataAccessDescription'),
        marginTop: 'mt-2',
      },
      {
        title: this.intl.t('reportModule.aiDataUsage'),
        body: this.intl.t('reportModule.aiDataUsageDescription'),
        marginTop: 'mt-2',
      },
      {
        title: this.intl.t('reportModule.aiDataProtection'),
        contentList: [
          this.intl.t('reportModule.aiDataProtectionList.item1'),
          this.intl.t('reportModule.aiDataProtectionList.item2'),
          this.intl.t('reportModule.aiDataProtectionList.item3'),
        ],
        marginTop: 'mt-2',
      },
    ];
  }

  @action openAIDrawer() {
    this.aiDrawerOpen = true;
  }

  @action closeAiDrawer() {
    this.aiDrawerOpen = false;
  }

  @action confirmFeatureToggle() {
    if (this.featureToToggle) {
      this.toggleReporting.perform(
        this.featureToToggle,
        this.targettedToggle?.checked
      );
    }
  }

  @action toggleAiFeature(featureKey: AiFeatureKey) {
    return (event: Event) => {
      this.targettedToggle = event.target as HTMLInputElement;

      this.targettedToggle.checked = !this.targettedToggle.checked;
      this.featureToToggle = featureKey;

      if (this.targettedToggle.checked) {
        this.drawerButtonLabel = this.intl.t('yesTurnOff');
      } else {
        this.drawerButtonLabel = this.intl.t('yesTurnOn');
      }

      this.aiDrawerOpen = true;
    };
  }

  toggleReporting = task(
    async (featureKey: AiFeatureKey, checked?: boolean) => {
      const originalValue = this.aiFeatures?.get(featureKey);

      try {
        this.aiFeatures?.set(featureKey, !checked);
        this.aiDrawerOpen = false;

        await this.aiFeatures?.save();
        await this.fetchOrganizationAiFeatures.perform();

        this.notify.success(this.intl.t('statusUpdatedSuccessfully'));
      } catch (err) {
        // Restore the original value on error
        this.aiDrawerOpen = false;
        this.aiFeatures?.set(featureKey, originalValue);

        this.notify.error(parseError(err));
      }
    }
  );

  fetchOrganizationAiFeatures = task(async () => {
    try {
      this.aiFeatures = await this.store.queryRecord(
        'organization-ai-feature',
        {}
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::AiPoweredFeatures': typeof OrganizationAiPoweredFeaturesComponent;
  }
}
