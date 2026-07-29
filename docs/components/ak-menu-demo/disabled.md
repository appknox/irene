---
order: 3
---

# Disabled

First item is `@disabled={{true}}` (Approve). Remaining rows match **With icon** styling.

```hbs template
<AkIconButton @variant='outlined' {{on 'click' this.handleMoreClick}}>
  <AkIcon @iconName='more-vert' />
</AkIconButton>

<AkMenu @arrow={{false}} @anchorRef={{this.anchorRef}} @onClose={{this.handleClose}} as |akm|>
  <akm.listItem @disabled={{true}} @onClick={{this.handleClose}} @divider={{true}} as |li|>
    <li.leftIcon>
      <AkIcon @iconName='done' @size='small' />
    </li.leftIcon>
    <li.text @primaryText='Approve' />
  </akm.listItem>

  {{#each this.menuData as |data|}}
    <akm.listItem @onClick={{this.handleClose}} @divider={{data.divider}} as |li|>
      <li.leftIcon>
        <AkIcon @iconName={{data.icon}} @size='small' />
      </li.leftIcon>
      <li.text @primaryText={{data.label}} />
    </akm.listItem>
  {{/each}}
</AkMenu>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked anchorRef = null;

  menuData = [
    { label: 'Add Project', icon: 'note-add', divider: true },
    { label: 'Add Member', icon: 'group-add', divider: true },
    { label: 'Delete', icon: 'delete', divider: false },
  ];

  @action
  handleMoreClick(event) {
    this.anchorRef = event.currentTarget;
  }

  @action
  handleClose() {
    this.anchorRef = null;
  }
}
```
