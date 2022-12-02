import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkSelect',
  component: 'ak-select',
  excludeStories: [],
};

const actions = {
  handleSelectChange(selected) {
    this.set('selected', selected);
  },
};

const selectItems = [
  { label: 'Maintainer', value: 'maintainer' },
  { label: 'Developer', value: 'developer' },
  { label: 'Reporter', value: 'reporter' },
];

const Template = (args) => ({
  template: hbs`
    {{!-- template-lint-disable no-action --}}
    {{!-- renderInPlace set true to work with storybook --}}
    <div class="m-2 w-4/12">
      <AkSelect 
        @onChange={{action this.handleSelectChange}} 
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
  context: { ...args, selectItems, ...actions },
});

export const Default = Template.bind({});

Default.args = {
  label: 'Experiment with me',
  placeholder: 'Select',
  selected: selectItems[0],
  helperText: '',
  disabled: false,
  error: false,
  required: false,
  onChange() {},
};
