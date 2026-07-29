# Mount and Unmount Content

Content is mounted only on first expansion / Content is unmounted on collapse

```hbs template
<AkStack @direction="column" @spacing="3" @width="full">
  <AkStack @direction="column" @spacing="1.5" @width="full">
    <AkTypography @variant="subtitle1" @color="inherit">Content is mounted only on first expansion</AkTypography>
    <AkAccordion
      @id="accordion1"
      @isExpanded={{this.accordion1}}
      @onChange={{this.handleChange}}
      @summaryText="Mounts content on expand"
      @summaryIconName="account-box"
      @mountContentOnExpand={{true}}
      @variant="secondary"
    >
      <:content>
        <div style="padding: 16px; background: #424651; color: #fff;">
          <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content that mounts only after first expansion</AkTypography>
        </div>
      </:content>
    </AkAccordion>
  </AkStack>

  <AkStack @direction="column" @spacing="1.5" @width="full">
    <AkTypography @variant="subtitle1" @color="inherit">Content is unmounted on collapse</AkTypography>
    <AkAccordion
      @id="accordion2"
      @isExpanded={{this.accordion2}}
      @onChange={{this.handleChange}}
      @summaryText="Unmounts content on collapse"
      @summaryIconName="account-box"
      @unmountContentOnCollapse={{true}}
      @variant="primary"
    >
      <:content>
        <div style="padding: 16px; background: #424651; color: #fff;">
          <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content that unmounts on collapse.</AkTypography>
        </div>
      </:content>
    </AkAccordion>
  </AkStack>
</AkStack>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked accordion1 = false;
  @tracked accordion2 = false;

  @action
  handleChange(id) {
    this[id] = !this[id];
  }
}
```
