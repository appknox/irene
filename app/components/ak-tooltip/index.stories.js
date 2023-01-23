import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkTooltip',
  component: 'ak-tooltip',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>Experiment with me</AkTypography>
    
    <div class="flex-row flex-justify-center flex-align-center w-full">
        <AkTooltip 
          @title={{this.title}} 
          @placement={{this.placement}} 
          @color={{this.color}} 
          @arrow={{this.arrow}}
          @disabled={{this.disabled}}>
            <AkLink>Link with tooltip</AkLink>
        </AkTooltip>
    </div>
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  title: 'I am a tooltip!',
  placement: 'bottom',
  arrow: true,
  color: 'dark',
  disabled: false,
};

const PlacementTemplate = (args) => ({
  template: hbs`
    <div class="flex-row flex-row-gap-3 flex-justify-center flex-align-center w-full mt-3">
        <AkTooltip @title="left" @placement="left" @color={{this.color}} @arrow={{this.arrow}}>
            <AkLink>Left</AkLink>
        </AkTooltip>

        <AkTooltip @title="top" @placement="top" @color={{this.color}} @arrow={{this.arrow}}>
            <AkLink>Top</AkLink>
        </AkTooltip>

        <AkTooltip @title="bottom" @placement="bottom" @color={{this.color}} @arrow={{this.arrow}}>
            <AkLink>Bottom</AkLink>
        </AkTooltip>

        <AkTooltip @title="right" @placement="right" @color={{this.color}} @arrow={{this.arrow}}>
            <AkLink>Right</AkLink>
        </AkTooltip>
    </div>
  `,
  context: args,
});

export const Placements = PlacementTemplate.bind({});

Placements.args = {
  arrow: true,
  color: 'dark',
};

const WithDelayTemplate = (args) => ({
  template: hbs`
    <div class="p-6 flex-row flex-justify-center flex-align-center w-full">
        <AkTooltip 
          @title={{this.title}} 
          @placement={{this.placement}} 
          @color={{this.color}} 
          @arrow={{this.arrow}}
          @disabled={{this.disabled}}
          @enterDelay={{this.enterDelay}}
          @leaveDelay={{this.leaveDelay}}>
            <AkLink>Delay Tooltip</AkLink>
        </AkTooltip>
    </div>
  `,
  context: args,
});

export const WithDelay = WithDelayTemplate.bind({});

WithDelay.args = {
  title: 'I am a delayed tooltip!',
  placement: 'bottom',
  arrow: true,
  color: 'dark',
  disabled: false,
  enterDelay: 500,
  leaveDelay: 200,
};
