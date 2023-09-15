import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkSkeleton',
  component: 'ak-skeleton',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>
        Experiment with me
    </AkTypography>

    <AkStack @direction='column' @spacing='1'>
      <AkSkeleton 
        @width='60px'
        @height='60px'
        @variant='circular'
        @tag={{this.tag}}
      />

      <AkSkeleton 
        @width={{this.width}}
        @height={{this.height}}
        @tag={{this.tag}}
      />

      <AkSkeleton 
        @width={{this.width}}
        @height={{this.height}}
        @variant='rectangular'
        @tag={{this.tag}}
      />

      <AkSkeleton 
        @width={{this.width}}
        @height={{this.height}}
        @variant='rounded'
        @tag={{this.tag}}
      />
    </AkStack>
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  width: '250px',
  height: '',
  tag: 'span',
};
