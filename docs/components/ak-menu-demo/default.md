---
order: 1
---

# Default

Click the trigger to open the menu. Items use plain `AkTypography` in each row.

```hbs template
<AkTypography @color='textSecondary' @gutterBottom={{true}}>
  Experiment with me
</AkTypography>

<AkIconButton @variant='outlined' {{on 'click' this.handleMoreClick}}>
  <AkIcon @iconName='more-vert' />
</AkIconButton>

<AkMenu @arrow={{false}} @anchorRef={{this.anchorRef}} @onClose={{this.handleClose}} as |akm|>
  {{#each this.menuData as |data|}}
    <akm.listItem @onClick={{this.handleClose}} @divider={{data.divider}}>
      <AkTypography>{{data.label}}</AkTypography>
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
