import Component from '@glimmer/component';

export interface AkListItemTextSignature {
  Element: HTMLDivElement;
  Args: {
    primaryText?: string;
    primaryTextClass?: string;
    secondaryText?: string;
    disabled?: boolean;
  };
}

export default class AkListItemTextComponent extends Component<AkListItemTextSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkList::ItemText': typeof AkListItemTextComponent;
    'ak-list/item-text': typeof AkListItemTextComponent;
  }
}
