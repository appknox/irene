import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkDatePicker',
  component: 'ak-date-picker',
  excludeStories: [],
};

const Template = (args) => {
  return {
    template: hbs`
        <AkDatePicker 
            @class={{this.class}} 
            @range={{this.range}} 
            @onChange={{this.onChange}} 
            @maxDate={{this.maxDate}} 
            @options={{this.options}}>
            <AkButton>
                Open date picker
            </AkButton>
        </AkDatePicker>
    `,
    context: args,
  };
};

export const Basic = Template.bind({});

Basic.args = {
  class: '',
  range: false,
  onChange: () => {},
  maxDate: null,
  options: ['today', 'last7Days', 'last3Months'],
};
