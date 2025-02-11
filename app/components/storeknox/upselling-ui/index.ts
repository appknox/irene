import Component from '@glimmer/component';

export default class StoreknoxUpsellingUiComponent extends Component {
  get storeknoxFeatureList() {
    return [
      'Discover apps that belong to your organization.',
      'Create and maintain a centralized inventory of all your mobile applications.',
      'Detect unscanned versions of your apps when they are released to the stores.',
      'Identify fake apps impersonating your brand and much more.',
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::UpsellingUi': typeof StoreknoxUpsellingUiComponent;
  }
}
