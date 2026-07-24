# Custom Blocks

Customized Summary UI / Summary Icon Only / Summary Text Only

```hbs template
<AkStack @direction="column" @spacing="3" @width="full">
  <AkStack @direction="column" @width="full">
    <AkTypography @variant="subtitle1" @gutterBottom={{true}} @color="inherit">Customized Summary UI</AkTypography>
    <AkAccordion @id="withIcon1" @isExpanded={{this.withIcon1}} @onChange={{this.handleChange}}>
      <:summary as |acs|>
        <AkStack @justifyContent="space-between" @alignItems="center" @width="full" class="p-2" style="border: 1px solid #2db421; cursor: pointer;" {{on 'click' acs.onSummaryClick}}>
          <AkTypography @color="success">Custom Summary UI</AkTypography>
          <AkIcon @iconName='arrow-drop-{{if acs.isExpanded "up" "down"}}' @color="success" />
        </AkStack>
      </:summary>
      <:content>
        <div style="padding: 16px; background: #fafafa; color: #424651;">
          <AkTypography @variant="body1" @gutterBottom={{true}} @color="inherit">- To customize the entire summary bar use the :summary block.</AkTypography>
          <AkTypography @variant="body1" @color="inherit">- The API needed to function was exposed to this block.</AkTypography>
        </div>
      </:content>
    </AkAccordion>
  </AkStack>

  <AkStack @direction="column" @width="full">
    <AkTypography @variant="subtitle1" @gutterBottom={{true}} @color="inherit">Customized Summary Icon Only</AkTypography>
    <AkAccordion @id="withIcon2" @isExpanded={{this.withIcon2}} @onChange={{this.handleChange}} @variant="primary" @summaryText="Secondary Variant with custom icon.">
      <:summaryIcon>
        <AkIcon @iconName='group' @color="success" />
      </:summaryIcon>
      <:content>
        <div style="padding: 16px; background: #fafafa; color: #424651;">
          <AkTypography @variant="body1" @gutterBottom={{true}} @color="inherit">- To customize the summary icon only use the :summaryIcon block.</AkTypography>
        </div>
      </:content>
    </AkAccordion>
  </AkStack>

  <AkStack @direction="column" @width="full">
    <AkTypography @variant="subtitle1" @gutterBottom={{true}} @color="inherit">Customized Summary Text Only</AkTypography>
    <AkAccordion @id="withIcon3" @isExpanded={{this.withIcon3}} @onChange={{this.handleChange}} @variant="primary" @summaryIconName="people">
      <:summaryText>
        <AkTypography @variant="subtitle1" @color="success">Custom Summary Text Only</AkTypography>
      </:summaryText>
      <:content>
        <div style="padding: 16px; background: #fafafa; color: #424651;">
          <AkTypography @variant="body1" @gutterBottom={{true}} @color="inherit">- To customize the summary text only use the :summaryText block.</AkTypography>
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
  @tracked withIcon1 = false;
  @tracked withIcon2 = false;
  @tracked withIcon3 = false;

  @action
  handleChange(id) {
    this[id] = !this[id];
  }
}
```
