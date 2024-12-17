import Component from '@glimmer/component';

export interface AkDividerSignature {
  Element: HTMLElement;
  Args: {
    tag?: string;
    variant?: 'fullWidth' | 'middle' | 'vertical';
    color?: 'light' | 'dark';
    direction?: 'horizontal' | 'vertical';
    height?: string;
    width?: string;
  };
  Blocks: { default: [] };
}

export default class AkDividerComponent extends Component<AkDividerSignature> {
  get isVertical() {
    return this.args.direction === 'vertical';
  }

  get height() {
    return this.isVertical ? this.args.height || '100%' : '1px';
  }

  get width() {
    return !this.isVertical ? this.args.width || '100%' : '1px';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkDivider: typeof AkDividerComponent;
  }
}
