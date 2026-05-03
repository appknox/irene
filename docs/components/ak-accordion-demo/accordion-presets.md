# Accordion Presets (Group)

```hbs template
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
```

```js component
import Component from '@glimmer/component';

export default class extends Component {
  accordionList = [
    { id: 'accordion-secondary', summaryText: 'Secondary Variant - Summary Text', accordionVariant: 'secondary' },
    { id: 'accordion-primary', summaryText: 'Primary Variant - Summary Text', accordionVariant: 'primary' },
    { id: 'accordion-disabled', disabled: true, summaryText: 'Disabled Variant - Summary Text', accordionVariant: 'secondary' },
    { id: 'accordion-open', summaryText: 'Default Open - Summary Text', accordionVariant: 'secondary' },
  ];
}
```
