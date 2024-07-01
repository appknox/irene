import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkChip',
  component: 'ak-chip',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>
        Experiment with me
    </AkTypography>

    <AkChip @label={{this.label}} @variant={{this.variant}} @size={{this.size}} @color={{this.color}} />
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  label: 'Chip filled',
  color: 'default',
  variant: 'filled',
  size: 'medium',
};

const WithIconTemplate = (args) => ({
  template: hbs`
    <AkChip 
        @label="Security" 
        @variant="filled" 
        @size={{this.size}} 
        @color={{this.color}}>
        <:icon>
            <AkIcon @iconName="security" />
        </:icon>    
    </AkChip>

    <AkChip 
        @label="Security" 
        @variant="outlined" 
        @size={{this.size}} 
        @color={{this.color}}>
        <:icon>
            <AkIcon @iconName="security" />
        </:icon> 
    </AkChip>

    <AkChip 
        @label="Security" 
        @variant="semi-filled" 
        @size={{this.size}} 
        @color={{this.color}}>
        <:icon>
            <AkIcon @iconName="security" />
        </:icon> 
    </AkChip>

    <AkChip 
        @label="Security" 
        @variant="semi-filled-outlined" 
        @size={{this.size}} 
        @color={{this.color}}>
        <:icon>
            <AkIcon @iconName="security" />
        </:icon> 
    </AkChip>
  `,
  context: args,
});

export const WithIcon = WithIconTemplate.bind({});

WithIcon.args = {
  color: 'default',
  size: 'medium',
};

const DeletableTemplate = (args) => ({
  template: hbs`
    <AkChip 
        @label="Deletable filled" 
        @onDelete={{this.handleDelete}} 
        @variant="filled" 
        @size={{this.size}} 
        @color={{this.color}} 
        @button={{this.button}}
        {{on 'click' this.handleClick}} />

    <AkChip 
        @label="Deletable outlined" 
        @onDelete={{this.handleDelete}} 
        @variant="outlined" 
        @size={{this.size}} 
        @color={{this.color}} 
        @button={{this.button}}
        {{on 'click' this.handleClick}} />
    
    <AkChip 
        @label="Deletable semi-filled" 
        @onDelete={{this.handleDelete}} 
        @variant="semi-filled" 
        @size={{this.size}} 
        @color={{this.color}} 
        @button={{this.button}}
        {{on 'click' this.handleClick}} />
    
    <AkChip 
        @label="Deletable semi-filled-outlined" 
        @onDelete={{this.handleDelete}} 
        @variant="semi-filled-outlined" 
        @size={{this.size}} 
        @color={{this.color}} 
        @button={{this.button}}
        {{on 'click' this.handleClick}} />
  `,
  context: {
    ...args,
    handleDelete(event) {
      alert('onDelete triggered!');
      console.log(event);
    },
    handleClick(event) {
      alert('Chip click triggered!');
      console.log(event);
    },
  },
});

export const Deletable = DeletableTemplate.bind({});

Deletable.args = {
  color: 'default',
  size: 'medium',
  button: true,
};
