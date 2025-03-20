import Component from '@glimmer/component';

export type AkIconColorVariant =
  | 'inherit'
  | 'textPrimary'
  | 'textSecondary'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'info'
  | 'warn';

export interface AkIconSignature {
  Element: HTMLSpanElement;
  Args: {
    variant?: 'filled' | 'outlined';
    iconName: string;
    size?: 'medium' | 'small';
    color?: AkIconColorVariant;
  };
}

export default class AkIconComponent extends Component<AkIconSignature> {
  get iconName() {
    const iconName = this.args.iconName;

    if (!iconName) {
      return '';
    }

    const [pkg, icon] = iconName.includes(':')
      ? iconName.split(':')
      : ['material-symbols', iconName];

    if (this.args.variant === 'outlined' && pkg === 'material-symbols') {
      return `${pkg}:${icon}-outline`;
    }

    return `${pkg}:${icon}`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkIcon: typeof AkIconComponent;
  }
}
