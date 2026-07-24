# Basic Autocomplete (String Options)

Type to filter options.

```hbs template
<AkAutocomplete
  @options={{this.options}}
  @searchQuery={{this.searchQuery}}
  @onChange={{this.handleChange}}
  @renderInPlace={{true}}
  as |ac|
>
  <AkTypography>{{ac}}</AkTypography>
</AkAutocomplete>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class extends Component {
  options = [
    'username',
    'password',
    'email',
    'phone',
    'phone2',
    'username2',
  ];

  searchQuery = '';

  @action
  handleChange(searchValue) {
    this.searchQuery = searchValue;
  }
}
```
