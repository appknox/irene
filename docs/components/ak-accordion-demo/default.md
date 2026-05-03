# Default (Standalone)

Experiment with this (Click to expand)

```hbs template
<AkAccordion
  @isExpanded={{this.accordionExpanded}}
  @onChange={{this.handleChange}}
  @summaryText="Experiment Summary Text"
  @summaryIconName="account-box"
  @disabled={{false}}
  @variant="secondary"
>
  <:content>
    <div style="padding: 16px; background: #424651; color: #fff;">
      <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
    </div>
  </:content>
</AkAccordion>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked accordionExpanded = false;

  @action
  handleChange() {
    this.accordionExpanded = !this.accordionExpanded;
  }
}
```
