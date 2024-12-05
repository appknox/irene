import { hbs } from 'ember-cli-htmlbars';
import { action, computed } from '@ember/object';

export default {
  title: 'AkCheckbox',
  component: 'ak-checkbox',
  excludeStories: [],
};

const actions = {
  handleClick(event) {
    console.log('click event!', event);
  },
  handleChange(event, checked) {
    console.log('change event!', { event, checked });
  },
};

const Template = (args) => ({
  template: hbs`
    <AkCheckbox 
      @checked={{this.checked}} 
      @indeterminate={{this.indeterminate}} 
      @disabled={{this.disabled}} 
      @readonly={{this.readonly}}
      @onClick={{this.handleClick}}
      @onChange={{this.handleChange}} />
  `,
  context: { ...args, ...actions },
});

export const Basic = Template.bind({});

Basic.args = {
  disabled: false,
  readonly: false,
  checked: true,
  indeterminate: false,
};

const LabelTemplate = (args) => ({
  template: hbs`
    <AkFormControlLabel @label={{this.label}} @disabled={{this.disabled}} as |fcl|>
        <AkCheckbox 
          @checked={{this.checked}} 
          @indeterminate={{this.indeterminate}} 
          @disabled={{fcl.disabled}} 
          @readonly={{this.readonly}}
          @onClick={{this.handleClick}}
          @onChange={{this.handleChange}} />
    </AkFormControlLabel>
  `,
  context: { ...args, ...actions },
});

export const Label = LabelTemplate.bind({});

Label.args = {
  label: 'Check me',
  disabled: false,
  readonly: false,
  checked: true,
  indeterminate: false,
};

function handleChange(event, checked) {
  console.log('select all change:', checked);
  this.set('checked1', checked);
  this.set('checked2', checked);
}

const IndeterminateTemplate = (args) => ({
  template: hbs`
    <AkFormControlLabel @label="Select all">
      <AkCheckbox @onChange={{this.handleChange}} @checked={{this.selectAllChecked}} @indeterminate={{this.selectAllIndeterminate}} />
    </AkFormControlLabel>

    <AkFormControlLabel @label="Check 1">
      <AkCheckbox @checked={{this.checked1}} />
    </AkFormControlLabel>

    <AkFormControlLabel @label="Check 2">
      <AkCheckbox @checked={{this.checked2}} />
    </AkFormControlLabel>
  `,
  context: {
    ...args,
    checked1: true,
    checked2: false,
    selectAllChecked: computed('checked1', 'checked2', {
      get() {
        return this.checked1 && this.checked2;
      },
      set(key, value) {
        return value;
      },
    }),
    selectAllIndeterminate: computed('checked1', 'checked2', function () {
      return this.checked1 !== this.checked2;
    }),
    handleChange: action(handleChange),
  },
});

export const Indeterminate = IndeterminateTemplate.bind({});

Indeterminate.args = {};
