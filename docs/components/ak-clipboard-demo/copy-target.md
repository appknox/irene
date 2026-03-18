---
order: 2
---

# Copy input text (target element)

Copies whatever value is currently in the field: edit the text, then use the button.

```hbs template
<AkTypography @color='textSecondary' @gutterBottom={{true}}>
  Experiment with me
</AkTypography>

<AkTextField
  id='doc-ak-clipboard-target-input'
  @value={{this.textToCopy}}
  {{on 'input' this.updateTextToCopy}}
/>

<AkClipboard @onSuccess={{this.onSuccess}} @onError={{this.onError}} as |cb|>
  <AkButton
    class='mt-2'
    data-clipboard-target='#doc-ak-clipboard-target-input'
    id={{cb.triggerId}}
  >
    Copy Input text
  </AkButton>
</AkClipboard>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked textToCopy = 'I will be copied!';

  @action
  updateTextToCopy(event) {
    this.textToCopy = event.target.value;
  }

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
