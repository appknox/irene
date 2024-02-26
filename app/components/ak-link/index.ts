import Component from '@glimmer/component';
import {
  TypographyFontWeight,
  TypographyVariant,
} from '../ak-typography/index';

export type AkLinkColors =
  | 'textPrimary'
  | 'textSecondary'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warn'
  | 'info'
  | 'inherit';

export type AkLinkTypographyVariant = TypographyVariant;
export type AkLinkTypographyFontWeight = TypographyFontWeight;

export interface AkLinkSignatureArgs {
  title?: string;
  class?: string;
  disabled?: boolean;
  fontWeight?: AkLinkTypographyFontWeight;
  color?: AkLinkColors;
  underline?: 'none' | 'always' | 'hover';
  noWrap?: boolean;
  typographyVariant?: AkLinkTypographyVariant;
  route?: string;
  model?: string;
  models?: string[];
  linkTextClass?: string;
  query?: Record<string, unknown>;
}

export interface AkLinkSignature {
  Element: HTMLAnchorElement;
  Args: AkLinkSignatureArgs;
  Blocks: {
    default: [];
    leftIcon: [];
    rightIcon: [];
  };
}

export default class AkLinkComponent extends Component<AkLinkSignature> {
  get modelOrModels() {
    if (this.args.model) {
      return [this.args.model];
    } else if (this.args.models) {
      return this.args.models;
    }

    return [];
  }

  get query() {
    return this.args.query || {};
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkLink: typeof AkLinkComponent;
  }
}
