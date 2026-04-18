---
order: 2
---

# Loading state

Shows the loading row in the dropdown while options are fetched.

```hbs template
<AkAutocomplete
  @options={{this.options}}
  @searchQuery={{this.searchQuery}}
  @onChange={{this.handleChange}}
  @loading={{true}}
  @renderInPlace={{true}}
  as |ac|
>
  <AkTypography>{{ac}}</AkTypography>
</AkAutocomplete>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  options = ['username', 'password', 'email', 'phone', 'phone2', 'username2'];

  @tracked searchQuery = '';

  @action
  handleChange(searchValue) {
    this.searchQuery = searchValue;
  }
}
```
