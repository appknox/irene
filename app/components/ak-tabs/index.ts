import Component from '@glimmer/component';
import AkTabsItemComponent from './item';

export interface AkTabsSignature {
  Element: HTMLElement;
  Blocks: { default: [{ tabItem: typeof AkTabsItemComponent }] };
}

export default class AkTabsComponent extends Component<AkTabsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkTabs: typeof AkTabsComponent;
  }
}
