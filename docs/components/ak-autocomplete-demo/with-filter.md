# With Filter Function

Custom filter with object options. Requires `filterFn` and `setInputValueFn`.

```hbs template
<AkAutocomplete
  @options={{this.options}}
  @searchQuery={{this.searchQuery}}
  @onChange={{this.handleChange}}
  @filterKey="label"
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

export default class extends Component {
  options = [
    { label: 'username' },
    { label: 'password' },
    { label: 'email' },
    { label: 'phone' },
    { label: 'phone2' },
    { label: 'username2' },
  ];
  searchQuery = 'ph';

  filterFn = (item) => item?.label?.startsWith('ph');
  setInputValueFn = (item) => item?.label || '';

  @action
  handleChange(searchValue) {
    this.searchQuery = searchValue;
  }
}
```
