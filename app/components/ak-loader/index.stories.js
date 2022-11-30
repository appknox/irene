import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkLoader',
  component: 'ak-loader',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkLoader @size={{this.size}} @thickness={{this.thickness}} />
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  size: 40,
  thickness: 4,
};
