import Component from '@glimmer/component';

export interface PlatformIconSignature {
  Args: {
    code?: number | string | null;
    size?: string;
  };
  Element: SVGElement;
}

export default class PlatformIconComponent extends Component<PlatformIconSignature> {
  get numCode(): number {
    if (
      this.args.code === null ||
      this.args.code === undefined ||
      this.args.code === ''
    ) {
      return -1;
    }
    const val = Number(this.args.code);
    return isNaN(val) ? -1 : val;
  }

  get iconSize(): string {
    return this.args.size ?? '20px';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    PlatformIcon: typeof PlatformIconComponent;
    'platform-icon': typeof PlatformIconComponent;
  }
}
