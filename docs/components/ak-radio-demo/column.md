---
order: 1
---

# Column group

Controlled group: pass **`@value`** and **`@onChange`** so the selected option updates when a radio is chosen. Includes a disabled option on the label.

```hbs template
<div style='display: flex; flex-direction: column; gap: 12px;'>
  <AkTypography @variant='body2' @color='textSecondary'>
    Selected:
    {{this.selected}}
  </AkTypography>

  <AkRadio::Group
    @value={{this.selected}}
    @onChange={{this.onGroupChange}}
    @groupDirection='column'
    as |ctx|
  >
    <AkFormControlLabel @label='Option A' as |fcl|>
      <AkRadio @radioCtx={{ctx}} @value='a' @disabled={{fcl.disabled}} />
    </AkFormControlLabel>
    <AkFormControlLabel @label='Option B' as |fcl|>
      <AkRadio @radioCtx={{ctx}} @value='b' @disabled={{fcl.disabled}} />
    </AkFormControlLabel>
    <AkFormControlLabel @label='Option C (disabled)' @disabled={{true}} as |fcl|>
      <AkRadio @radioCtx={{ctx}} @value='c' @disabled={{fcl.disabled}} />
    </AkFormControlLabel>
  </AkRadio::Group>
</div>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked selected = 'a';

  @action
  onGroupChange(_event, value) {
    this.selected = value;
  }
}
```
