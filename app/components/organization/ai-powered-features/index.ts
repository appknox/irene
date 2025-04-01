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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::AiPoweredFeatures': typeof OrganizationAiPoweredFeaturesComponent;
  }
}
