# With Icon

```hbs template
<AkStack @direction="column" @spacing="1.5" @width="full">
  <AkAccordion
    @id="withIcon1"
    @isExpanded={{this.withIcon1}}
    @onChange={{this.handleChange}}
    @summaryText="Secondary - Summary text with Icon"
    @variant="secondary"
    @summaryIconName="people"
  >
    <:content>
      <div style="padding: 16px; background: #424651; color: #fff;">
        <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
      </div>
    </:content>
  </AkAccordion>

  <AkAccordion
    @id="withIcon2"
    @isExpanded={{this.withIcon2}}
    @onChange={{this.handleChange}}
    @summaryText="Primary - Summary text with Icon"
    @variant="primary"
    @summaryIconName="people"
  >
    <:content>
      <div style="padding: 16px; background: #424651; color: #fff;">
        <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
      </div>
    </:content>
  </AkAccordion>

  <AkAccordion
    @id="withIcon3"
    @isExpanded={{this.withIcon3}}
    @onChange={{this.handleChange}}
    @disabled={{true}}
    @summaryText="Disabled - Summary text with Icon"
    @variant="secondary"
    @summaryIconName="people"
  >
    <:content>
      <div style="padding: 16px; background: #424651; color: #fff;">
        <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
      </div>
    </:content>
  </AkAccordion>
</AkStack>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked withIcon1 = false;
  @tracked withIcon2 = false;
  @tracked withIcon3 = false;

  @action
  handleChange(id) {
    this[id] = !this[id];
  }
}
```
