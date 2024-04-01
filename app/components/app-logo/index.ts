import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';

interface AppLogoSignature {
  Element: HTMLElement;
  Args: {
    src?: string;
    alt?: string;
    padding?: boolean;
    loading?: boolean;
    rounded?: boolean;
    size?: 'small' | 'medium' | 'large';
    role?: string;
    border?: boolean;
  };
}

export default class AppLogoComponent extends Component<AppLogoSignature> {
  get size() {
    return this.args.size || 'small';
  }

  get padding() {
    return isEmpty(this.args.padding) ? true : this.args.padding;
  }

  get paddingClass() {
    return this.padding ? 'app-logo-container-padding' : '';
  }

  get alt() {
    return this.args.alt || '';
  }

  get src() {
    return this.args.src || '';
  }

  get role() {
    return this.args.role || 'img';
  }

  get border() {
    return isEmpty(this.args.border) ? true : this.args.border;
  }

  get borderClass() {
    return this.border ? 'app-logo-container-border' : '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AppLogo: typeof AppLogoComponent;
  }
}
