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

type AiFeatureKey = 'pii' | 'reporting';

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
        featureKey: 'pii' as const,
        isChecked: this.aiFeatures?.pii,
        enabled: this.features?.pii,
        label: this.intl.t('privacyModule.piiLabel'),
        description: this.intl.t('privacyModule.piiDesc'),
        header: this.intl.t('privacyModule.piiLabel'),
        tooltipContent: this.intl.t('privacyModule.piiSettingsNoAccess'),
        drawerInfo: this.piiDrawerInfo,

        isToggling:
          this.featureToToggle === 'pii' && this.toggleFeature.isRunning,
      },
    ];
  }

  get drawerInfo() {
    switch (this.featureToToggle) {
      case 'pii':
        return this.piiDrawerInfo;
      default:
        return null;
    }
  }

  get piiDrawerInfo() {
    return [
      {
        title: this.intl.t('privacyModule.piiAiDrawer.aiDataQ1'),
        body: this.intl.t('privacyModule.piiAiDrawer.aiDataQ1Desc'),
        marginTop: 'mt-2',
      },
      {
        title: this.intl.t('privacyModule.piiAiDrawer.aiDataQ2'),
        body: this.intl.t('privacyModule.piiAiDrawer.aiDataQ2Desc'),
        marginTop: 'mt-2',
      },
      {
        title: this.intl.t('privacyModule.piiAiDrawer.aiDataQ3'),
        body: this.intl.t('privacyModule.piiAiDrawer.aiDataQ3Desc', {
          htmlSafe: true,
        }),
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
      this.toggleFeature.perform(
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

  toggleFeature = task(async (featureKey: AiFeatureKey, checked?: boolean) => {
    try {
      this.aiFeatures?.set(featureKey, !checked);
      this.aiDrawerOpen = false;

      await this.aiFeatures?.save();
      await this.fetchOrganizationAiFeatures.perform();

      this.notify.success(this.intl.t('statusUpdatedSuccessfully'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

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
