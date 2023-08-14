import Component from '@glimmer/component';

interface AkIconButtonSignature {
  Element: HTMLButtonElement;
  Args: {
    variant?: 'outlined' | 'default';
    type?: 'submit' | 'reset' | 'button';
    size?: 'medium' | 'small';
    borderColor?: 'default' | 'primary' | 'secondary';
  };

  Blocks: {
    default: [];
  };
}

export default class AkIconButtonComponent extends Component<AkIconButtonSignature> {
  get size() {
    return this.args.size || 'medium';
  }

  get variant() {
    return this.args.variant || 'default';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkIconButton: typeof AkIconButtonComponent;
  }
}
