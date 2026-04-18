---
order: 1
---

# Copy Me (fixed text)

Copies the string from `data-clipboard-text` on the trigger. Change that attribute to use any text.

```hbs template
<AkTypography @color='textSecondary' @gutterBottom={{true}}>
  Experiment with me
</AkTypography>

<AkClipboard @onSuccess={{this.onSuccess}} @onError={{this.onError}} as |cb|>
  <AkButton data-clipboard-text='I am copied!' id={{cb.triggerId}}>
    Copy Me
  </AkButton>
</AkClipboard>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class extends Component {
  @action
  onSuccess(event) {
    window.alert(`${event.text} is successfully copied.`);
  }

  @action
  onError(event) {
    window.alert(`${event.action} errored.`);
  }
}
```
