import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

function handleSelectChange(selected) {
  this.set('selected', selected);
}

const selectItems = [
  { label: 'Maintainer', value: 'maintainer' },
  { label: 'Developer', value: 'developer' },
  { label: 'Reporter', value: 'reporter' },
];

const selectCommonArgs = {
  label: 'Experiment with me',
  placeholder: 'Select',
  selected: selectItems[0],
  helperText: '',
  disabled: false,
  error: false,
  required: false,
  onChange() {},
  handleSelectChange: action(handleSelectChange),
};

export default {
  title: 'AkSelect',
  component: 'ak-select',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    {{!-- renderInPlace set true to work with storybook --}}
    <div class="m-2 w-4/12">
      <AkSelect 
        @onChange={{this.handleSelectChange}} 
        @options={{this.selectItems}} 
        @selected={{this.selected}}
        @renderInPlace={{true}} 
        @label={{this.label}} 
        @placeholder={{this.placeholder}}
        @helperText={{this.helperText}}
        @disabled={{this.disabled}}
        @required={{this.required}}
        @error={{this.error}} as |aks|>
          {{aks.label}}
      </AkSelect>
    </div>
  `,
  context: { ...args, selectItems },
});

export const Default = Template.bind({});

Default.args = selectCommonArgs;

const SelectMultipleTemplate = (args) => ({
  template: hbs`
    {{!-- renderInPlace set true to work with storybook --}}
    <div class="m-2 w-4/12">
      <AkSelect 
        @onChange={{this.handleSelectChange}} 
        @options={{this.selectItems}} 
        @selected={{this.selected}}
        @renderInPlace={{true}} 
        @label={{this.label}} 
        @placeholder={{this.placeholder}}
        @helperText={{this.helperText}}
        @disabled={{this.disabled}}
        @required={{this.required}}
        @multiple={{this.multiple}}
        @error={{this.error}} as |aks|>
          {{aks.label}}
      </AkSelect>
    </div>
  `,
  context: { ...args, selectItems },
});

export const SelectMultiple = SelectMultipleTemplate.bind({});

SelectMultiple.args = {
  ...selectCommonArgs,
  multiple: true,
  selected: [selectItems[0]],
};
