# Button Variant

```hbs template
<AkTabs as |Akt|>
  {{#each this.tabItems as |item|}}
    <Akt.tabItem
      @hidden={{item.hidden}}
      @id={{item.id}}
      @hasBadge={{item.hasBadge}}
      @badgeCount={{item.badgeCount}}
      @isActive={{eq this.activeTab item.id}}
      @buttonVariant={{true}}
      @onTabClick={{this.onTabClick}}
      @indicatorVariant="line"
    >
      <:tabIcon>
        <AkIcon @iconName={{item.iconName}} />
      </:tabIcon>
      <:default>{{item.label}}</:default>
    </Akt.tabItem>
  {{/each}}
</AkTabs>
<div class="p-3">
  <AkTypography>Content for {{this.currentTabDetails.label}}</AkTypography>
</div>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked activeTab = 1;

  tabItems = [
    { id: 1, hidden: false, badgeCount: 9, hasBadge: true, label: 'Tab One', iconName: 'assignment' },
    { id: 2, hidden: false, badgeCount: 100, hasBadge: true, label: 'Tab Two', iconName: 'group' },
  ];

  get currentTabDetails() {
    return this.tabItems.find((tab) => tab.id === this.activeTab) || this.tabItems[0];
  }

  @action
  onTabClick(tabId) {
    this.activeTab = tabId;
  }
}
```
