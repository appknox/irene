import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganizationAiPoweredFeaturesComponent extends Component {
  @tracked aiDrawerOpen = false;

  @action openAIDrawer() {
    this.aiDrawerOpen = true;
  }

  @action closeAiDrawer() {
    this.aiDrawerOpen = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::AiPoweredFeatures': typeof OrganizationAiPoweredFeaturesComponent;
  }
}
