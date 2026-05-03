---
order: 2
---

# Right anchor

Same pattern with `@anchor='right'`.

```hbs template
<div>
  <AkButton {{on 'click' this.openDrawer}}>
    Open drawer
  </AkButton>

  <AkDrawer
    @anchor='right'
    @open={{this.isOpen}}
    @onClose={{this.closeDrawer}}
    as |drawer|
  >
    <div
      style='width: 280px; padding: 16px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px;'
    >
      <AkTypography @variant='h6'>Right drawer</AkTypography>
      <AkTypography @variant='body2'>
        Filters or detail content often live here.
      </AkTypography>
      <AkButton @variant='outlined' {{on 'click' drawer.closeHandler}}>
        Close
      </AkButton>
    </div>
  </AkDrawer>
</div>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked isOpen = false;

  @action
  openDrawer() {
    this.isOpen = true;
  }

  @action
  closeDrawer() {
    this.isOpen = false;
  }
}
```
