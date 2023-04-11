import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkAccordion',
  component: 'ak-accordion',
  excludeStories: ['actionsData'],
};

export const actionsData = {};

const accordionList = [
  {
    isExpanded: false,
    summaryText: 'Secondary Variant - Summary Text',
    accordionVariant: 'secondary',
  },
  {
    isExpanded: false,
    summaryText: 'Primary Variant - Summary Text',
    accordionVariant: 'primary',
  },
  {
    isExpanded: true,
    disabled: true,
    summaryText: 'Disabled Variant - Summary Text',
    accordionVariant: 'secondary',
  },
  {
    isExpanded: true,
    summaryText: 'Default Open - Summary Text',
    accordionVariant: 'secondary',
  },
];

const Template = (args) => ({
  template: hbs`
    <AkStack @direction="column" @spacing="3" @width="full" class="mt-3">
      <AkStack @direction="column" @spacing="1.5" @width="full">
        <AkTypography @variant="subtitle1" @color="inherit">Experiment with this (Click to expand)</AkTypography>
        
        <AkAccordion
            @isExpanded={{this.isExpanded}}
            @summaryText={{this.summaryText}}
            @summaryIconName={{this.summaryIconName}}
            @disabled={{this.disabled}}
            @variant={{this.accordionVariant}}
        >
            <:content>
              <div class="p-3 m-2" style="color: #ffffff; background-color: #424651;" >
                <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
              </div>
            </:content>
        </AkAccordion>
      </AkStack>

      <AkDivider />

      <AkStack @direction="column" @width="full">
        <AkTypography @variant="subtitle1" @color="inherit" @gutterBottom={{true}}>Accordion Presets</AkTypography>
        
        {{#each this.accordionList as |accordion|}}
          <AkAccordion
            @isExpanded={{accordion.isExpanded}}
            @summaryText={{accordion.summaryText}}
            @disabled={{accordion.disabled}}
            @variant={{accordion.accordionVariant}}
          >
            <:content>
              <div class="p-3 m-2" style="color: #ffffff; background-color: #424651;" >
                <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
              </div>
            </:content>
          </AkAccordion>
        {{/each}}
      </AkStack>
    </AkStack>
  `,
  context: { ...args, accordionList },
});

export const Default = Template.bind({});

Default.args = {
  isExpanded: false,
  disabled: false,
  summaryText: 'Experiment Summary Text',
  summaryIconName: 'account-box',
  accordionVariant: 'secondary',
};

const WithIconTemplate = () => ({
  template: hbs`
    <AkStack @direction="column" @spacing="1.5" @width="full" class="mt-3">
      <AkAccordion
        @isExpanded={{false}}
        @summaryText="Secondary - Summary text with Icon"
        @variant="secondary"
        @summaryIconName="people"
      >
        <:content>
          <div class="p-3 m-2" style="color: #ffffff; background-color: #424651;" >
            <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
          </div>
        </:content>
      </AkAccordion>

      <AkAccordion
        @isExpanded={{false}}
        @summaryText="Primary - Summary text with Icon"
        @variant="primary"
        @summaryIconName="people"
      >
        <:content>
          <div class="p-3 m-2" style="color: #ffffff; background-color: #424651;" >
            <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
          </div>
        </:content>
      </AkAccordion>

      <AkAccordion
        @isExpanded={{false}}
        @disabled={{true}}
        @summaryText="Disabled - Summary text with Icon"
        @variant="secondary"
        @summaryIconName="people"
      >
        <:content>
          <div class="p-3 m-2" style="color: #ffffff; background-color: #424651;" >
            <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
          </div>
        </:content>
      </AkAccordion>
    </AkStack>
  `,
  context: {},
});

export const WithIcon = WithIconTemplate.bind({});

const CustomTemplate = () => ({
  template: hbs`
    <AkStack @direction="column" @spacing="3" @width="full" class="mt-3">

      <AkStack @direction="column" @width="full">
        <AkTypography @variant="subtitle1" @gutterBottom={{true}} @color="inherit">Customized Summary UI</AkTypography>
        
        <AkAccordion @isExpanded={{false}}>
          <:summary as |acs|>
            <AkStack @justifyContent="space-between" @alignItems="center" @width="full" class="p-2" {{style border="1px solid #2db421" cursor="pointer"}} {{on 'click' acs.onSummaryClick}}>
              <AkTypography @color="success">
                Custom Summary UI
              </AkTypography>

              <AkIcon
                @iconName='arrow-drop-{{if acs.isExpanded "up" "down"}}'
                @color="success"
              />
            </AkStack>
          </:summary>

          <:content>
            <div class="p-3 m-2" style="color: #424651; background-color: #fafafa;" >
              <AkTypography @variant="body1" @gutterBottom={{true}} @color="inherit">- To customize the entire summary bar use the <span class="bold">:summary</span> block. </AkTypography>
              <AkTypography @variant="body1" @color="inherit">- The API needed to function was exposed to this block.</AkTypography>
            </div>
          </:content>
        </AkAccordion>
      </AkStack>

      <AkDivider @color="dark" />

      <AkStack @direction="column" @width="full">
        <AkTypography @variant="subtitle1" @gutterBottom={{true}} @color="inherit">Customized Summary Icon Only</AkTypography>
        
        <AkAccordion @isExpanded={{false}} @variant="primary" @summaryText="Secondary Variant with custom icon.">
          <:summaryIcon>
            <AkIcon
              @iconName='people'
              @color="success"
            />
          </:summaryIcon>

          <:content>
            <div class="p-3 m-2" style="color: #424651; background-color: #fafafa;" >
              <AkTypography @variant="body1" @gutterBottom={{true}} @color="inherit">- To customize the summary icon only use the <span class="bold">:summaryIcon</span> block. </AkTypography>
            </div>
          </:content>
        </AkAccordion>
      </AkStack>

      <AkDivider @color="dark" />

      <AkStack @direction="column" @width="full">
        <AkTypography @variant="subtitle1" @gutterBottom={{true}} @color="inherit">Customized Summary Text Only</AkTypography>
        
        <AkAccordion @isExpanded={{false}} @variant="primary" @summaryIconName="people">
          <:summaryText>
            <AkTypography @variant="subtitle1" @color="success">
              Custom Summary Text Only
            </AkTypography>
          </:summaryText>

          <:content>
            <div class="p-3 m-2" style="color: #424651; background-color: #fafafa;" >
              <AkTypography @variant="body1" @gutterBottom={{true}} @color="inherit">- To customize the summary text only use the <span class="bold">:summaryText</span> block. </AkTypography>
            </div>
          </:content>
        </AkAccordion>
      </AkStack>


    </AkStack>
  `,
  context: {},
});

export const Custom = CustomTemplate.bind({});
