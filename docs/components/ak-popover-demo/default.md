# Default Popover

Click the icon to open the popover.

```hbs template
<AkIconButton @variant="outlined" {{on 'click' this.handleMoreClick}}>
  <AkIcon @iconName="more-vert" />
</AkIconButton>

<AkPopover
  @anchorRef={{this.anchorRef}}
  @arrow={{false}}
  @hasBackdrop={{true}}
  @onBackdropClick={{this.handleClose}}
  @closeHandler={{this.handleClose}}
>
  <div style="padding: 16px; background: #fff; border: 1px solid #e9e9e9; box-shadow: 4px 4px 10px rgba(0,0,0,0.15);">
    <AkTypography>I am inside a popover</AkTypography>
  </div>
</AkPopover>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked anchorRef = null;

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
