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

export default class OrganizationAiPoweredFeaturesComponent extends Component {
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked aiDrawerOpen = false;
  @tracked aiFeatures: OrganizationAiFeatureModel | null = null;
  @tracked drawerButtonLabel: string = '';
  @tracked targettedToggle: HTMLInputElement | null = null;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchOrganizationAiFeatures.perform();
  }

  get showReporting() {
    return this.organization.selected?.aiFeatures?.reporting;
  }

  @action openAIDrawer() {
    this.aiDrawerOpen = true;
  }

  @action closeAiDrawer() {
    this.aiDrawerOpen = false;
  }

  get drawerInfo() {
    return [
      {
        title: 'What data does this AI model access in my app?',
        body: 'Lorem ipsum dolor sit amet consectetur. Volutpat ullamcorper in placerat viverra ipsum imperdiet malesuada tellus. Fermentum quis varius eget faucibus vivamus. Commodo sagittis non duis sit tincidunt facilisi bibendum mi. Tortor aliquam egestas in non. Fermentum.',
        marginTop: 'mt-2',
      },
      {
        title:
          'Does any 3rd party product/service have access to this model which has been trained using my organizations applications?',
        body: 'Lorem ipsum dolor sit amet consectetur. Laoreet fermentum arcu at elementum amet maecenas est ultrices. Enim dapibus facilisi adipiscing commodo velit accumsan vitae.',
        marginTop: 'mt-3',
      },
      {
        title: 'How is this AI model secured from potential threats?',
        body: 'Lorem ipsum dolor sit amet consectetur. Volutpat ullamcorper in placerat viverra ipsum imperdiet malesuada tellus. Fermentum quis varius eget faucibus vivamus. Commodo sagittis non duis sit tincidunt facilisi bibendum mi. Tortor aliquam egestas in non. Fermentum faucibus elementum tristique donec elit vitae posuere etiam. Sem est commodo mattis elementum etiam vitae pellentesque aliquet.',
        marginTop: 'mt-3',
      },
    ];
  }

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

  @action confirm() {
    this.toggleReporting.perform(this.targettedToggle?.checked);
  }

  @action toggle(event: Event) {
    this.targettedToggle = event.target as HTMLInputElement;

    this.targettedToggle.checked = !this.targettedToggle.checked;

    if (this.targettedToggle.checked) {
      this.drawerButtonLabel = this.intl.t('yesTurnOff');
    } else {
      this.drawerButtonLabel = this.intl.t('yesTurnOn');
    }

    this.aiDrawerOpen = true;
  }

  toggleReporting = task(async (checked) => {
    try {
      this.aiFeatures?.set('reporting', !checked);

      this.aiDrawerOpen = false;

      await this.aiFeatures?.save();
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
