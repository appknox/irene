import Component from '@glimmer/component';

export interface AkDividerSignature {
  Element: HTMLElement;
  Args: {
    tag?: string;
    variant?: 'fullWidth' | 'middle';
    color?: 'light' | 'dark';
    direction?: 'horizontal' | 'vertical';
  };
  Blocks: { default: [] };
}

export default class AkDividerComponent extends Component<AkDividerSignature> {
  get isVertical() {
    return this.args.direction === 'vertical';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkDivider: typeof AkDividerComponent;
  }
}
