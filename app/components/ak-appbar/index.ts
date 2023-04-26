import Component from '@glimmer/component';
import styles from './index.scss';

import { AkStackSignature } from '../ak-stack';

type DefaultBlock = {
  classes: {
    defaultIconBtn?: string;
  };
};

type AkAppbarDirection = AkStackSignature['Args']['direction'];
type AkAppbarAlignItems = AkStackSignature['Args']['alignItems'];
type AkAppbarSpacing = AkStackSignature['Args']['alignItems'];
type AkAppbarJustifyContent = AkStackSignature['Args']['justifyContent'];

export interface AkAppbarSignature {
  Element: HTMLElement;
  Args: {
    direction?: AkAppbarDirection;
    alignItems?: AkAppbarAlignItems;
    justifyContent?: AkAppbarJustifyContent;
    spacing?: AkAppbarSpacing;
    placement?: 'top' | 'bottom';
    position?: 'static' | 'fixed' | 'relative' | 'absolute' | 'sticky';
    gutter?: boolean;
    elevation?: boolean;
    color?: 'inherit' | 'default' | 'light' | 'dark';
  };
  Blocks: {
    default: [DefaultBlock];
  };
}

export default class AkAppbarComponent extends Component<AkAppbarSignature> {
  get classes() {
    return {
      defaultIconBtn: styles['ak-appbar-default-icon-button'],
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkAppbar: typeof AkAppbarComponent;
  }
}
