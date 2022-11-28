import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkTypography',
  component: 'ak-typography',
  excludeStories: ['actionsData'],
};

export const actionsData = {};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>
        Experiment with me
    </AkTypography>

    <AkTypography 
        @tag={{this.tag}}
        @variant={{this.variant}}
        @color={{this.color}} 
        @gutterBottom={{this.gutterBottom}}
        @noWrap={{this.noWrap}}
        @underline={{this.underline}}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    </AkTypography>
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  tag: '',
  variant: 'h4',
  color: '',
  gutterBottom: false,
  noWrap: false,
  underline: 'none',
};

const AllVariantsTemplate = (args) => ({
  template: hbs`
    <AkTypography @variant="h1" @gutterBottom={{true}}>This is heading 1</AkTypography>
    <AkTypography @variant="h2" @gutterBottom={{true}}>This is heading 2</AkTypography>
    <AkTypography @variant="h3" @gutterBottom={{true}}>This is heading 3</AkTypography>
    <AkTypography @variant="h4" @gutterBottom={{true}}>This is heading 4</AkTypography>
    <AkTypography @variant="h5" @gutterBottom={{true}}>This is heading 5</AkTypography>
    <AkTypography @variant="h6" @gutterBottom={{true}}>This is heading 6</AkTypography>

    <AkTypography @variant="subtitle1" @gutterBottom={{true}}>This is subtitle 1</AkTypography>
    <AkTypography @variant="subtitle2" @gutterBottom={{true}}>This is subtitle 2</AkTypography>

    <AkTypography @variant="body1" @gutterBottom={{true}}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
    </AkTypography>
    <AkTypography @variant="body2" @gutterBottom={{true}}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
    </AkTypography>
  `,
  context: args,
});

export const AllVariants = AllVariantsTemplate.bind({});

AllVariants.args = {};

const TruncatedTemplate = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>
        Big line
    </AkTypography>

    <AkTypography @variant="body1" @noWrap={{this.noWrap}}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
    </AkTypography>
  `,
  context: args,
});

export const Truncated = TruncatedTemplate.bind({});

Truncated.args = {
  noWrap: true,
};
