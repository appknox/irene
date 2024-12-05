import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkAccordion',
  component: 'ak-accordion',
  excludeStories: ['actionsData'],
};

export const actionsData = {};

const accordionList = [
  {
    id: 'accordion-secondary',
    summaryText: 'Secondary Variant - Summary Text',
    accordionVariant: 'secondary',
  },
  {
    id: 'accordion-primary',
    summaryText: 'Primary Variant - Summary Text',
    accordionVariant: 'primary',
  },
  {
    id: 'accordion-disabled',
    disabled: true,
    summaryText: 'Disabled Variant - Summary Text',
    accordionVariant: 'secondary',
  },
  {
    id: 'accordion-open',
    summaryText: 'Default Open - Summary Text',
    accordionVariant: 'secondary',
  },
];

function handleChange() {
  this.set('accordionExpanded', !this.accordionExpanded);
}

function handleChangeId(id) {
  this.set(id, !this[id]);
}

const Template = (args) => ({
  template: hbs`
    <AkStack @direction="column" @spacing="3" @width="full" class="mt-3">
      <AkStack @direction="column" @spacing="1.5" @width="full">
        <AkTypography @variant="subtitle1" @color="inherit">Experiment with this (Click to expand)</AkTypography>
        
        <AkAccordion
            @isExpanded={{this.accordionExpanded}}
            @onChange={{this.handleChange}}
            @summaryText={{this.summaryText}}
            @summaryIconName={{this.summaryIconName}}
            @disabled={{this.disabled}}
            @variant={{this.accordionVariant}}
        >
            <:content>
              <div class="p-3 m-2" {{style color='#ffffff' backgroundColor='#424651'}} >
                <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
              </div>
            </:content>
        </AkAccordion>
      </AkStack>

      <AkDivider />

      <AkStack @direction="column" @width="full">
        <AkTypography @variant="subtitle1" @color="inherit" @gutterBottom={{true}}>Accordion Presets</AkTypography>
        
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
                <div class="p-3 m-2" {{style color='#ffffff' backgroundColor='#424651'}} >
                  <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
                </div>
              </:content>
            </AkAccordion>
          {{/each}}
        </AkAccordion::Group>
      </AkStack>
    </AkStack>
  `,
  context: { ...args, accordionList },
});

export const Default = Template.bind({});

Default.args = {
  disabled: false,
  summaryText: 'Experiment Summary Text',
  summaryIconName: 'account-box',
  accordionVariant: 'secondary',
  accordionExpanded: false,
  handleChange: action(handleChange),
};

const WithIconTemplate = (args) => ({
  template: hbs`
    <AkStack @direction="column" @spacing="1.5" @width="full" class="mt-3">
      <AkAccordion
        @id="withIcon1"
        @isExpanded={{this.withIcon1}}
        @onChange={{this.handleChange}}
        @summaryText="Secondary - Summary text with Icon"
        @variant="secondary"
        @summaryIconName="people"
      >
        <:content>
          <div class="p-3 m-2" {{style color='#ffffff' backgroundColor='#424651'}} >
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
          <div class="p-3 m-2" {{style color='#ffffff' backgroundColor='#424651'}} >
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
          <div class="p-3 m-2" {{style color='#ffffff' backgroundColor='#424651'}} >
            <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
          </div>
        </:content>
      </AkAccordion>
    </AkStack>
  `,
  context: {
    ...args,
    withIcon1: false,
    withIcon2: false,
    withIcon3: false,
    handleChange: action(handleChangeId),
  },
});

export const WithIcon = WithIconTemplate.bind({});

const CustomTemplate = (args) => ({
  template: hbs`
    <AkStack @direction="column" @spacing="3" @width="full" class="mt-3">

      <AkStack @direction="column" @width="full">
        <AkTypography @variant="subtitle1" @gutterBottom={{true}} @color="inherit">Customized Summary UI</AkTypography>
        
        <AkAccordion  
          @id="withIcon1"
          @isExpanded={{this.withIcon1}}
          @onChange={{this.handleChange}}
        >
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
            <div class="p-3 m-2" {{style color='#424651' backgroundColor='#fafafa'}} >
              <AkTypography @variant="body1" @gutterBottom={{true}} @color="inherit">- To customize the entire summary bar use the <span class="bold">:summary</span> block. </AkTypography>
              <AkTypography @variant="body1" @color="inherit">- The API needed to function was exposed to this block.</AkTypography>
            </div>
          </:content>
        </AkAccordion>
      </AkStack>

      <AkDivider @color="dark" />

      <AkStack @direction="column" @width="full">
        <AkTypography @variant="subtitle1" @gutterBottom={{true}} @color="inherit">Customized Summary Icon Only</AkTypography>
        
        <AkAccordion    
          @id="withIcon2"
          @isExpanded={{this.withIcon2}}
          @onChange={{this.handleChange}}
          @variant="primary" 
          @summaryText="Secondary Variant with custom icon."
         >
          <:summaryIcon>
            <AkIcon
              @iconName='people'
              @color="success"
            />
          </:summaryIcon>

          <:content>
            <div class="p-3 m-2" {{style color='#424651' backgroundColor='#fafafa'}} >
              <AkTypography @variant="body1" @gutterBottom={{true}} @color="inherit">- To customize the summary icon only use the <span class="bold">:summaryIcon</span> block. </AkTypography>
            </div>
          </:content>
        </AkAccordion>
      </AkStack>

      <AkDivider @color="dark" />

      <AkStack @direction="column" @width="full">
        <AkTypography @variant="subtitle1" @gutterBottom={{true}} @color="inherit">Customized Summary Text Only</AkTypography>
        
        <AkAccordion    
          @id="withIcon3"
          @isExpanded={{this.withIcon3}}
          @onChange={{this.handleChange}}
          @variant="primary" 
          @summaryIconName="people"
        >
          <:summaryText>
            <AkTypography @variant="subtitle1" @color="success">
              Custom Summary Text Only
            </AkTypography>
          </:summaryText>

          <:content>
            <div class="p-3 m-2" {{style color='#424651' backgroundColor='#fafafa'}} >
              <AkTypography @variant="body1" @gutterBottom={{true}} @color="inherit">- To customize the summary text only use the <span class="bold">:summaryText</span> block. </AkTypography>
            </div>
          </:content>
        </AkAccordion>
      </AkStack>
    </AkStack>
  `,
  context: {
    ...args,
    withIcon1: false,
    withIcon2: false,
    withIcon3: false,
    handleChange: action(handleChangeId),
  },
});

export const Custom = CustomTemplate.bind({});

const GroupsTemplate = (args) => ({
  template: hbs`
    <AkStack @direction="column" @spacing="3" @width="full" class="mt-3">
      <AkStack @direction="column" @width="full">
        <AkTypography @variant="h4" @color="inherit" @gutterBottom={{true}}>Group with multple expanded</AkTypography>
        
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
                <div class="p-3 m-2" {{style color='#ffffff' backgroundColor='#424651'}} >
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
                <div class="p-3 m-2" {{style color='#ffffff' backgroundColor='#424651'}} >
                  <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content</AkTypography>
                </div>
              </:content>
            </AkAccordion>
          {{/each}}
        </AkAccordion::Group>
      </AkStack>
    </AkStack>
  `,
  context: { ...args, accordionList: accordionList.slice(0, 2) },
});

export const Groups = GroupsTemplate.bind({});

const MountAndUnmountContentTemplate = (args) => ({
  template: hbs`
    <AkStack @direction="column" @spacing="3" @width="full" class="mt-3">
      <AkStack @direction="column" @spacing="1.5" @width="full">
        <AkTypography @variant="subtitle1" @color="inherit">Content is mounted only on first expansion</AkTypography>
        
        <AkAccordion
            @id="accordion1"
            @isExpanded={{this.accordion1}}
            @onChange={{this.handleChange}}
            @summaryText="Mounts content on expand"
            @summaryIconName={{this.summaryIconName}}
            @mountContentOnExpand={{this.mountContentOnExpand}}
            @disabled={{this.disabled}}
            @variant={{this.accordionVariant}}
        >
            <:content>
              <div class="p-3 m-2" {{style color='#ffffff' backgroundColor='#424651'}} >
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
            @summaryIconName={{this.summaryIconName}}
            @unmountContentOnCollapse={{this.unmountContentOnCollapse}}
            @disabled={{this.disabled}}
            @variant="primary"
        >
            <:content>
              <div class="p-3 m-2" {{style color='#ffffff' backgroundColor='#424651'}} >
                <AkTypography @variant="subtitle1" @color="inherit">This is an accordion content that unmounts on collapse.</AkTypography>
              </div>
            </:content>
        </AkAccordion>
      </AkStack>
    </AkStack>
  `,
  context: {
    ...args,
    disabled: false,
    summaryIconName: 'account-box',
    accordionVariant: 'secondary',
    mountContentOnExpand: true,
    unmountContentOnCollapse: true,
    accordion1: false,
    accordion2: false,
    handleChange: action(handleChangeId),
  },
});

export const MountAndUnmountContent = MountAndUnmountContentTemplate.bind({});
