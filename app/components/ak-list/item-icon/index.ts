import Component from '@glimmer/component';

export interface AkListItemIconSignature {
  Element: HTMLDivElement;
  Args: {
    leftGutter?: boolean;
    rightGutter?: boolean;
    disabled?: boolean;
  };
  Blocks: { default: [] };
}

export default class AkListItemIconComponent extends Component<AkListItemIconSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkList::ItemIcon': typeof AkListItemIconComponent;
    'ak-list/item-icon': typeof AkListItemIconComponent;
  }
}
