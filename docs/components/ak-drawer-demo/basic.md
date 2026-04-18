---
order: 1
---

# Basic (left)

Opens from the **left**. Yield `closeHandler` to close from inside the panel (backdrop click also closes unless `disableBackdropClick` is set).

```hbs template
<div>
  <AkButton {{on 'click' this.openDrawer}}>
    Open drawer
  </AkButton>

  <AkDrawer
    @anchor='left'
    @open={{this.isOpen}}
    @onClose={{this.closeDrawer}}
    as |drawer|
  >
    <div
      style='width: 250px; padding: 16px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px;'
    >
      <AkTypography @variant='h6'>Drawer</AkTypography>
      <AkTypography>I am the content of Drawer.</AkTypography>
      <AkButton {{on 'click' drawer.closeHandler}}>Close</AkButton>
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
