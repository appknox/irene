import Component from '@glimmer/component';
import { WithBoundArgs } from '@glint/template';

import AkListItemIconComponent from '../item-icon';
import AkListItemTextComponent from '../item-text';

export interface AkListItemSignature {
  Element: HTMLLIElement;
  Args: {
    route?: string;
    query?: Record<string, unknown>;
    currentWhen?: string;
    model?: string;
    models?: string[];
    disabled?: boolean;
    button?: boolean;
    link?: boolean;
    selected?: boolean;
    role?: string;
    noGutters?: boolean;
    divider?: boolean;
    activeLinkClass?: string;
    linkClass?: string;
    buttonClass?: string;
    onClick?: (event: MouseEvent) => void;
  };
  Blocks: {
    default: [
      {
        leftIcon: WithBoundArgs<
          typeof AkListItemIconComponent,
          'disabled' | 'rightGutter'
        >;
        rightIcon: WithBoundArgs<
          typeof AkListItemIconComponent,
          'disabled' | 'leftGutter'
        >;
        text: WithBoundArgs<typeof AkListItemTextComponent, 'disabled'>;
      }
    ];
  };
}

export default class AkListItemComponent extends Component<AkListItemSignature> {
  noop() {}

  get route() {
    return this.args.route || '';
  }

  get modelOrModels() {
    if (this.args.model) {
      return [this.args.model];
    } else if (this.args.models) {
      return this.args.models;
    }

    return [];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkList::Item': typeof AkListItemComponent;
    'ak-list/item': typeof AkListItemComponent;
  }
}
