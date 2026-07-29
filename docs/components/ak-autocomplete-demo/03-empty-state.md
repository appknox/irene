---
order: 3
---

# Empty state

When the search text matches no options, the default empty message is shown (`No matching items`). Open the field and use the current query to see the empty state.

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
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  options = ['username', 'password', 'email', 'phone', 'phone2', 'username2'];

  @tracked searchQuery = 'non-existent-item';

  @action
  handleChange(searchValue) {
    this.searchQuery = searchValue;
  }
}
```
