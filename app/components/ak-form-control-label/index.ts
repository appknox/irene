import Component from '@glimmer/component';
import { TypographyColors, TypographyVariant } from '../ak-typography';
import { ComponentLike } from '@glint/template';

type LabelTypographyVariant = TypographyVariant;
type LabelTypographyColor = TypographyColors;

export interface AkFormControlLabelSignature {
  Element: HTMLLabelElement;
  Args: {
    placement?: 'right' | 'left';
    disabled?: boolean;
    label?: string;
    labelTypographyVariant?: LabelTypographyVariant;
    labelTypographyNoWrap?: boolean;
    labelTypographyColor?: LabelTypographyColor;
  };
  Blocks: {
    default: [
      {
        control: ComponentLike<{ Blocks: { default: [] } }>;
        disabled?: boolean;
      }
    ];
    label: [];
  };
}

export default class AkFormControlLabelComponent extends Component<AkFormControlLabelSignature> {
  get placement() {
    return this.args.placement || 'right';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkFormControlLabel: typeof AkFormControlLabelComponent;
  }
}
