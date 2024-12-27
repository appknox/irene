import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkAutocomplete',
  component: 'ak-autocomplete',
  excludeStories: [],
};

const stringOptions = [
  'username',
  'password',
  'email',
  'phone',
  'phone2',
  'username2',
];

const objectOptions = [
  { label: 'username' },
  { label: 'password' },
  { label: 'email' },
  { label: 'phone' },
  { label: 'phone2' },
  { label: 'username2' },
];

function onChange(searchValue) {
  this.set('searchQuery', searchValue);
}

const AutocompleteTemplate = (args) => {
  return {
    template: hbs`
      <AkAutocomplete
        @options={{this.options}}
        @searchQuery={{this.searchQuery}}
        @onChange={{this.handleChange}}
        @loading={{this.loadingOptions}}
        @filterFn={{this.filterFn}}
        @filterKey={{this.filterKey}}
        @setInputValueFn={{this.setInputValueFn}}
        as |ac|
        >
        {{#if this.filterKey}}
          <AkTypography>{{ac.label}}</AkTypography>
        {{else}}
          <AkTypography>{{ac}}</AkTypography>
        {{/if}}
      </AkAutocomplete>
      `,
    context: {
      ...args,
      handleChange: action(onChange),
      options: args.objectOptions ? objectOptions : stringOptions,
    },
  };
};

export const Basic = AutocompleteTemplate.bind({});
Basic.args = {
  searchQuery: '',
};

export const LoadingState = AutocompleteTemplate.bind({});
LoadingState.args = {
  searchQuery: '',
  loadingOptions: true,
  loadingBlock: true,
  emptyBlock: false,
};

export const EmptyState = AutocompleteTemplate.bind({});
EmptyState.args = {
  searchQuery: 'non-existent-item',
  emptyBlock: true,
  loadingBlock: false,
};

export const WithFilterFunction = AutocompleteTemplate.bind({});
WithFilterFunction.args = {
  searchQuery: 'ph',
  filterKey: 'label',
  filterFn: (item) => item?.label?.startsWith('ph'),
  objectOptions: true,
  setInputValueFn: (item) => item?.label,
};
