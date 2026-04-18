# With Event

```hbs template
<AkTextField
  @label={{this.label}}
  @placeholder={{this.placeholder}}
  @value={{this.value}}
  {{on "change" this.handleChange}}
  {{on "blur" this.handleBlur}}
/>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked value = '';
  label = 'Type something and click outside to see alert';
  placeholder = 'Enter something';

  @action
  handleChange(event) {
    this.value = event.target.value;
  }

  @action
  handleBlur(event) {
    alert(event.target.value);
  }
}
```
