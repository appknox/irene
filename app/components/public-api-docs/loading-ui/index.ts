import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class PublicApiDocsLoadingUIComponent extends Component {
  @action
  getArray(length: number) {
    return Array.from({ length }, (_, idx) => idx);
  }

  @action getWidth(section: number, min = 0.4, max = 1) {
    return `${((section / 10) * (min - max) + max) * 100}%`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PublicApiDocs::LoadingUi': typeof PublicApiDocsLoadingUIComponent;
  }
}
