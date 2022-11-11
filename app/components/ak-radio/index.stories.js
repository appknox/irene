import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkRadio',
  component: 'ak-radio',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkRadio::Group @groupDirection={{this.groupDirection}} as |ctx|>
        <AkFormControlLabel @disabled={{this.disabled}} @label="{{this.label}} 1" as |fcl|>
            <AkRadio @value="radio1" @radioCtx={{ctx}} @disabled={{fcl.disabled}} />
        </AkFormControlLabel>
        <AkFormControlLabel @disabled={{this.disabled}} @label="{{this.label}} 2" as |fcl|>
            <AkRadio @value="radio2" @radioCtx={{ctx}} @disabled={{fcl.disabled}} />
        </AkFormControlLabel>
    </AkRadio::Group>
  `,
  context: args,
});

export const Basic = Template.bind({});

Basic.args = {
  label: 'Radio',
  groupDirection: 'row',
  disabled: false,
};
