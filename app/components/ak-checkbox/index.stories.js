import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkCheckbox',
  component: 'ak-checkbox',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkFormControlLabel @label={{this.label}} @disabled={{this.disabled}} as |fcl|>
        <AkCheckbox @disabled={{fcl.disabled}} @readonly={{this.readonly}} />
    </AkFormControlLabel>
  `,
  context: args,
});

export const Basic = Template.bind({});

Basic.args = {
  label: 'Check me',
  disabled: false,
  readonly: false,
};
