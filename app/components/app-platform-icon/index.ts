import Component from '@glimmer/component';

export type AppPlatformIconSize = 'small' | 'medium';

export interface AppPlatformIconSignature {
  Element: HTMLSpanElement;
  Args: {
    platform: 'android' | 'apple';
    size?: AppPlatformIconSize;
  };
}

export default class AppPlatformIconComponent extends Component<AppPlatformIconSignature> {
  get iconName() {
    return this.args.platform === 'apple' ? 'fa-brands:apple' : 'android';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AppPlatformIcon: typeof AppPlatformIconComponent;
  }
}
