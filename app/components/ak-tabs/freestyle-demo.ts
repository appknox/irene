import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const TAB_ITEMS = [
  {
    id: 1,
    hidden: false,
    badgeCount: 9,
    hasBadge: true,
    label: 'Tab One',
    iconName: 'assignment',
  },
  {
    id: 2,
    hidden: false,
    badgeCount: 100,
    hasBadge: true,
    label: 'Tab Two',
    iconName: 'group',
  },
];

export default class AkTabsFreestyleDemoComponent extends Component {
  tabItems = TAB_ITEMS;
  @tracked activeTab = 1;

  get currentTabDetails() {
    return this.tabItems.find((tab) => tab.id === this.activeTab);
  }

  @action
  onTabClick(tabId: number) {
    this.activeTab = tabId;
  }
}
