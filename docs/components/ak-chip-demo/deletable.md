# Deletable Chips

```hbs template
<div style="display: flex; flex-wrap: wrap; gap: 12px;">
  <AkChip
    @label="Deletable filled"
    @onDelete={{this.handleDelete}}
    @variant="filled"
    @size="medium"
    @color="default"
    @button={{true}}
  />
  <AkChip
    @label="Deletable outlined"
    @onDelete={{this.handleDelete}}
    @variant="outlined"
    @size="medium"
    @color="default"
    @button={{true}}
  />
  <AkChip
    @label="Deletable semi-filled"
    @onDelete={{this.handleDelete}}
    @variant="semi-filled"
    @size="medium"
    @color="default"
    @button={{true}}
  />
  <AkChip
    @label="Deletable semi-filled-outlined"
    @onDelete={{this.handleDelete}}
    @variant="semi-filled-outlined"
    @size="medium"
    @color="default"
    @button={{true}}
  />
</div>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class extends Component {
  @action
  handleDelete() {
    // Handle delete
  }
}
```
