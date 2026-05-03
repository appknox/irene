# Default Select

```hbs template
<div style="width: 300px;">
  <AkSelect
    @options={{this.selectItems}}
    @selected={{this.selected}}
    @onChange={{this.handleSelectChange}}
    @renderInPlace={{true}}
    @label="Role"
    @placeholder="Select"
    as |aks|
  >
    {{aks.label}}
  </AkSelect>
</div>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class extends Component {
  selectItems = [
    { label: 'Maintainer', value: 'maintainer' },
    { label: 'Developer', value: 'developer' },
    { label: 'Reporter', value: 'reporter' },
  ];

  selected = this.selectItems[0];

  @action
  handleSelectChange(selected) {
    this.selected = selected;
  }
}
```
