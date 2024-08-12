import Component from '@glimmer/component';

export interface AppPlatformIconSignature {
  Element: HTMLSpanElement;
  Args: {
    platform: 'android' | 'apple';
  };
}

export default class AppPlatformIconComponent extends Component<AppPlatformIconSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AppPlatformIcon: typeof AppPlatformIconComponent;
  }
}
