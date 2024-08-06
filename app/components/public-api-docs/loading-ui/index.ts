import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class PublicApiDocsLoadingUIComponent extends Component {
  @action
  getArray(length: number) {
    return Array.from({ length }, (_, idx) => idx);
  }

  @action getRandomWidth(min = 0.4, max = 1) {
    return `${(Math.random() * (min - max) + max) * 100}%`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PublicApiDocs::LoadingUi': typeof PublicApiDocsLoadingUIComponent;
  }
}
