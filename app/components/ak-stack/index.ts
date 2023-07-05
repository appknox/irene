import Component from '@glimmer/component';

type AkStackDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type AkStackJustifyContentValues =
  | 'start'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'flex-end'
  | 'flex-start'
  | 'stretch'
  | 'end'
  | 'left'
  | 'right'
  | 'normal';

type AkStackAlignItemsValues =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

type AkStackFlexWrapValues = 'wrap' | 'nowrap' | 'wrap-reverse';
type AkStackWidthValues =
  | '1/12'
  | '2/12'
  | '3/12'
  | '4/12'
  | '5/12'
  | '6/12'
  | '7/12'
  | '8/12'
  | '9/12'
  | '10/12'
  | '11/12'
  | '12/12'
  | 'full'
  | 'fit-content'
  | 'auto';

export interface AkStackArgs {
  tag?: string;
  spacing?: string | number;
  direction?: AkStackDirection;
  width?: AkStackWidthValues;
  justifyContent?: AkStackJustifyContentValues;
  alignItems?: AkStackAlignItemsValues;
  flexWrap?: AkStackFlexWrapValues;
}

export interface AkStackSignature {
  Element: HTMLElement;
  Args: AkStackArgs;
  Blocks: {
    default: [];
  };
}

export default class AkStackComponent extends Component<AkStackSignature> {
  defaultTag = 'div';

  get tag() {
    return this.args.tag || this.defaultTag;
  }

  get spacingUnit() {
    try {
      const spacing = String(this.args.spacing);
      const value = parseFloat(spacing);

      // check is number
      if (isNaN(value)) {
        return '';
      }
      // check is integer
      else if (Math.ceil(value) === value) {
        return `${parseInt(String(value))}`;
      }

      // else is float value
      return `${parseInt(String(value * 2))}/2`;
    } catch (e) {
      return '';
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkStack: typeof AkStackComponent;
  }
}
