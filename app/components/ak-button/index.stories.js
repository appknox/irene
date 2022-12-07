import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkButton',
  component: 'ak-button',
  excludeStories: ['actionsData'],
};

export const actionsData = {};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>Experiment with me</AkTypography>
    
    <AkButton 
        @type={{this.type}}
        @disabled={{this.disabled}}>
        Filled Primary
    </AkButton>

    <AkButton 
        @type={{this.type}}
        @variant="outlined"
        @disabled={{this.disabled}}>
        Outlined Primary
    </AkButton>

    <AkButton 
        @type={{this.type}}
        @color="neutral"
        @variant="outlined"
        @disabled={{this.disabled}}>
        Outlined Neutral
    </AkButton>

    <AkButton 
        @type={{this.type}}
        @color="primary"
        @variant="text"
        @disabled={{this.disabled}}>
        Text Primary
    </AkButton>
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  type: 'button',
  disabled: false,
};

const TextButtonTemplate = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>Experiment with me</AkTypography>

    <AkButton 
        @type={{this.type}}
        @color={{this.color}}
        @variant="text"
        @disabled={{this.disabled}}
        @underline={{this.underline}}
        @typographyVariant={{this.typographyVariant}}>
        Text Button
    </AkButton>
  `,
  context: args,
});

export const TextButton = TextButtonTemplate.bind({});

TextButton.args = {
  color: '',
  underline: '',
  typographyVariant: '',
  type: 'button',
  disabled: false,
};

const DisabledTemplate = (args) => ({
  template: hbs`
    <AkButton @disabled={{this.disabled}}>
        Filled Primary
    </AkButton>

    <AkButton @variant="outlined" @disabled={{this.disabled}}>
        Outlined Primary
    </AkButton>

    <AkButton @color="neutral" @variant="outlined" @disabled={{this.disabled}}>
        Outlined Neutral
    </AkButton>

    <AkButton @color="primary" @variant="text" @disabled={{this.disabled}}>
        Text Primary
    </AkButton>
  `,
  context: args,
});

export const Disabled = DisabledTemplate.bind({});

Disabled.args = {
  disabled: true,
};

const WithIconsTemplate = (args) => ({
  template: hbs`
    <AkButton>
        <:leftIcon>
            <AkIcon @iconName="delete" />
        </:leftIcon>

        <:default>
            Delete
        </:default>
    </AkButton>

    <AkButton @variant="outlined">
        <:leftIcon>
            <AkIcon @iconName="note-add" />
        </:leftIcon>

        <:default>Add Note</:default>
    </AkButton>

    <AkButton @color="neutral" @variant="outlined">
        <:leftIcon>
            <AkIcon @iconName="refresh" />
        </:leftIcon>
        
        <:default>Refresh</:default>
    </AkButton>
  `,
  context: args,
});

export const WithIcons = WithIconsTemplate.bind({});

WithIcons.args = {};

const LoadingButtonTemplate = (args) => ({
  template: hbs`
    <AkButton @loading={{this.loading}}> 
        Loading Button
    </AkButton>

    <AkButton @loading={{this.loading}}>
        <:leftIcon>
            <AkIcon @iconName="note-add" />
        </:leftIcon>

        <:default>
          Loading With Icons
        </:default>

        <:rightIcon>
            <AkIcon @iconName="arrow-drop-down" />
        </:rightIcon>
    </AkButton>
  `,
  context: args,
});

export const LoadingButton = LoadingButtonTemplate.bind({});

LoadingButton.args = {
  loading: true,
};
