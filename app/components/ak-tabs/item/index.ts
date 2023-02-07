import { action } from '@ember/object';
import Component from '@glimmer/component';
import styles from './index.scss';

export interface AkTabsItemSignature {
  Element: HTMLLIElement;
  Args: {
    id: number | string;
    isActive?: boolean;
    hasBadge?: boolean;
    buttonVariant?: boolean;
    badgeCount?: string | number;
    onTabClick?: (id: number | string, event: MouseEvent) => void;
    disabled?: boolean;
    route?: string;
    model?: string;
    models?: string[];
    query?: Record<string, unknown>;
  };

  Blocks: {
    default: [];
    tabIcon: [];
  };
}

export default class AkTabsItemComponent extends Component<AkTabsItemSignature> {
  get classes() {
    return {
      activeClass: styles['active'],
    };
  }

  @action onTabClick(event: MouseEvent) {
    if (this.args.onTabClick) {
      this.args.onTabClick(this.args.id, event);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkTabs::Item': typeof AkTabsItemComponent;
    'ak-tabs/item': typeof AkTabsItemComponent;
  }
}
