import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

import { TypographyVariant, TypographyColors } from '../ak-typography';

type LabelTypographyVariant = TypographyVariant;
type LabelTypographyColor = TypographyColors;

export interface AkTextFieldSignature {
  Element: HTMLInputElement;
  Args: {
    formControlClass?: string;
    id?: string;
    label?: string;
    labelTypographyVariant?: LabelTypographyVariant;
    labelTypographyColor?: LabelTypographyColor;
    required?: boolean;
    type?: string;
    value?: string;
    placeholder?: string;
    autofocus?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    helperText?: string;
    error?: boolean;
  };
  Blocks: {
    leftAdornment: [];
    rightAdornment: [];
  };
}

export default class AkTextFieldComponent extends Component<AkTextFieldSignature> {
  get id() {
    return this.args.id || `ak-textfield-${guidFor(this)}`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkTextField: typeof AkTextFieldComponent;
  }
}
