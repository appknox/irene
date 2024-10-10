import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import UserModel from 'irene/models/user';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export interface StoreknoxComponentSignature {
  Element: HTMLElement;
  Args: {
    user: UserModel;
  };
  Blocks: {
    default: [];
  };
}

export default class StoreknoxComponent extends Component<StoreknoxComponentSignature> {
  @service('browser/window') declare window: Window;
  @service declare session: any;

  @tracked isSidebarCollapsed: boolean;

  constructor(owner: unknown, args: StoreknoxComponentSignature['Args']) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem('sidebarState');

    this.isSidebarCollapsed =
      storedState !== null ? storedState === 'collapsed' : true;
  }

  @action
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;

    this.window.localStorage.setItem(
      'sidebarState',
      this.isSidebarCollapsed ? 'collapsed' : 'expanded'
    );
  }

  @action invalidateSession() {
    triggerAnalytics('logout', {} as CsbAnalyticsData);
    this.session.invalidate();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Storeknox: typeof StoreknoxComponent;
  }
}
