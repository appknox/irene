import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkStack',
  component: 'ak-stack',
  excludeStories: [],
};

const Template = (args) => {
  return {
    template: hbs`
    <AkStack 
      @spacing={{this.spacing}} 
      @direction={{this.direction}} 
      @alignItems={{this.alignItems}} 
      @justifyContent={{this.justifyContent}} 
      @width={{this.width}}
      class="p-3"
      {{style height='fit-content' border='1px solid #ff4d3f'}}
    >
      <span class="p-2" {{style border='1px solid #eee'}}>
        Item - 1
      </span>
      <span class="p-2" {{style border='1px solid #eee'}}>
        Item - 2
      </span>
      <span class="p-2" {{style border='1px solid #eee'}}>
        Item - 3
      </span>
    </AkStack>
  `,
    context: args,
  };
};

export const Basic = Template.bind({});

Basic.args = {
  spacing: '0',
  direction: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: 'fit-content',
};
