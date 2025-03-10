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

const MaterialSymbol = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>
        Experiment with me
    </AkTypography>

    <AkIcon @variant={{this.variant}} @iconName={{this.iconName}} @color={{this.color}} @size={{this.size}} />
  `,
  context: args,
});

export const AkSymbol = MaterialSymbol.bind({});

AkSymbol.args = {
  iconName: 'network-intel-node',
  color: 'textPrimary',
  size: 'medium',
  variant: 'symbol',
};
