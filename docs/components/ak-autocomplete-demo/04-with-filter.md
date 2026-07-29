---
order: 4
---

# With filter function

Custom filter with object options. Requires `filterFn` and `setInputValueFn`. The filter uses the current query as a prefix match on `label`.

```hbs template
<AkAutocomplete
  @options={{this.options}}
  @searchQuery={{this.searchQuery}}
  @onChange={{this.handleChange}}
  @filterKey='label'
  @filterFn={{this.filterFn}}
  @setInputValueFn={{this.setInputValueFn}}
  @renderInPlace={{true}}
  as |ac|
>
  <AkTypography>{{ac.label}}</AkTypography>
</AkAutocomplete>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  options = [
    { label: 'username' },
    { label: 'password' },
    { label: 'email' },
    { label: 'phone' },
    { label: 'phone2' },
    { label: 'username2' },
  ];

  @tracked searchQuery = 'ph';

  filterFn = (item) => {
    const q = (this.searchQuery || '').toLowerCase();
    if (!q) {
      return true;
    }
    return item?.label?.toLowerCase().startsWith(q);
  };

  setInputValueFn = (item) => item?.label || '';

  @action
  handleChange(searchValue) {
    this.searchQuery = searchValue;
  }
}
```
