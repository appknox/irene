import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkIcon',
  component: 'ak-icon',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>
        Experiment with me
    </AkTypography>

    <AkIcon @iconName={{this.iconName}} @color={{this.color}} @size={{this.size}} />
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  iconName: 'delete',
  color: 'textPrimary',
  size: 'medium',
};
