import Component from '@glimmer/component';
import { WithBoundArgs } from '@glint/template';

import AkListItemIconComponent from '../item-icon';
import AkListItemTextComponent from '../item-text';

export interface AkListItemSignature {
  Element: HTMLLIElement;
  Args: {
    route?: string;
    query?: Record<string, unknown>;
    model?: string;
    models?: string[];
    disabled?: boolean;
    button?: boolean;
    link?: boolean;
    selected?: boolean;
    role?: string;
    noGutters?: boolean;
    divider?: boolean;
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
    const hasModel = 'model' in this.args;
    const hasModels = 'models' in this.args;

    if (hasModel) {
      return [this.args.model];
    } else if (hasModels) {
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