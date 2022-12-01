import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkLink',
  component: 'ak-link',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>Experiment with me</AkTypography>
    
    <AkLink 
        @class={{this.class}} 
        @color={{this.color}}
        @underline={{this.underline}}
        @title={{this.title}}
        @disabled={{this.disabled}}>
          <:leftIcon>
                <AkIcon @iconName="arrow-back"/>
          </:leftIcon>

          <:default>
            Link
          </:default>
    </AkLink>
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  class: '',
  title: '',
  disabled: false,
  underline: 'hover',
  color: 'textPrimary',
};

const ColorsTemplate = (args) => ({
  template: hbs`
    <div class="flex-row flex-row-gap-3">
        <AkLink>Text primary</AkLink>

        <AkLink @color="textSecondary">Text secondary</AkLink>

        <AkLink @color="primary">Primary</AkLink>

        <AkLink @color="secondary">Secondary</AkLink>
    </div>
  `,
  context: args,
});

export const Colors = ColorsTemplate.bind({});

Colors.args = {};

const WithIconsTemplate = (args) => ({
  template: hbs`
    <div class="flex-row flex-row-gap-3">
        <AkLink>
            <:leftIcon>
                <AkIcon @iconName="arrow-back"/>
            </:leftIcon>

            <:default>
                Back
            </:default>
        </AkLink>

        <AkLink @color="textSecondary">
            <:leftIcon>
                <AkIcon @iconName="arrow-back"/>
            </:leftIcon>

            <:default>
                Back
            </:default>
        </AkLink>

        <AkLink @color="primary">
            <:leftIcon>
                <AkIcon @iconName="arrow-back"/>
            </:leftIcon>

            <:default>
                Back
            </:default>
        </AkLink>

        <AkLink @color="secondary">
            <:leftIcon>
                <AkIcon @iconName="arrow-back"/>
            </:leftIcon>

            <:default>
                Back
            </:default>
        </AkLink>
    </div>
  `,
  context: args,
});

export const WithIcons = WithIconsTemplate.bind({});

WithIcons.args = {};

const UnderlineTemplate = (args) => ({
  template: hbs`
    <div class="flex-row flex-row-gap-3">
        <AkLink @underline="none">Text primary</AkLink>

        <AkLink @underline="hover" @color="primary">Primary</AkLink>

        <AkLink @underline="always" @color="secondary">Secondary</AkLink>
    </div>
  `,
  context: args,
});

export const Underline = UnderlineTemplate.bind({});

Underline.args = {};

const DisabledTemplate = (args) => ({
  template: hbs`
    <div class="flex-row flex-row-gap-3">
        <AkLink @disabled={{this.disabled}}>Text primary</AkLink>

        <AkLink @color="textSecondary" @disabled={{this.disabled}}>Text secondary</AkLink>

        <AkLink @color="primary" @disabled={{this.disabled}}>Primary</AkLink>

        <AkLink @color="secondary" @disabled={{this.disabled}}>Secondary</AkLink>
    </div>
  `,
  context: args,
});

export const Disabled = DisabledTemplate.bind({});

Disabled.args = {
  disabled: true,
};
