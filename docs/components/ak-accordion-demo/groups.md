# Groups

Group with multiple expanded / Group with single expanded at a time

```hbs template
<AkStack @direction="column" @spacing="3" @width="full">
  <AkStack @direction="column" @width="full">
    <AkTypography @variant="h4" @color="inherit" @gutterBottom={{true}}>Group with multiple expanded</AkTypography>
    <AkAccordion::Group @openMultiple={{true}} @defaultOpen={{array "accordion-open"}} class="w-full" as |actx|>
      {{#each this.accordionList as |accordion|}}
        <AkAccordion
          @id={{accordion.id}}
          @accordionCtx={{actx}}
          @summaryText={{accordion.summaryText}}
          @disabled={{accordion.disabled}}
          @variant={{accordion.accordionVariant}}
        >
          <:content>
            <div style="padding: 16px; background: #424651; color: #fff;">
              <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
            </div>
          </:content>
        </AkAccordion>
      {{/each}}
    </AkAccordion::Group>
  </AkStack>

  <AkStack @direction="column" @width="full">
    <AkTypography @variant="h4" @color="inherit" @gutterBottom={{true}}>Group with single expanded at a time</AkTypography>
    <AkAccordion::Group @defaultOpen={{array "accordion-secondary"}} class="w-full" as |actx|>
      {{#each this.accordionList as |accordion|}}
        <AkAccordion
          @id={{accordion.id}}
          @accordionCtx={{actx}}
          @summaryText={{accordion.summaryText}}
          @disabled={{accordion.disabled}}
          @variant={{accordion.accordionVariant}}
        >
          <:content>
            <div style="padding: 16px; background: #424651; color: #fff;">
              <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
            </div>
          </:content>
        </AkAccordion>
      {{/each}}
    </AkAccordion::Group>
  </AkStack>
</AkStack>
```

```js component
import Component from '@glimmer/component';

export default class extends Component {
  accordionList = [
    { id: 'accordion-secondary', summaryText: 'Secondary Variant - Summary Text', accordionVariant: 'secondary' },
    { id: 'accordion-primary', summaryText: 'Primary Variant - Summary Text', accordionVariant: 'primary' },
  ];
}
```
