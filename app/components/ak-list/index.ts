import Component from '@glimmer/component';
import AkListItemComponent from './item';

export interface AkListSignature {
  Element: HTMLUListElement;
  Blocks: { default: [{ listItem: typeof AkListItemComponent }] };
}

export default class AkListComponent extends Component<AkListSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkList: typeof AkListComponent;
  }
}
