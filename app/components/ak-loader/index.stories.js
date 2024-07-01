import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkLoader',
  component: 'ak-loader',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkStack @direction='column' @spacing='2.5' @width='full'>
      <div class="w-full">
        <AkTypography
          @variant='h5'
          @gutterBottom={{true}}
        >
          Default Loader
        </AkTypography>

        <AkLoader @size={{this.size}} @thickness={{this.thickness}} @color={{this.color}}  />
      </div>

      <AkDivider />

      <div class="w-full">
        <AkTypography
          @variant='h5'
          @gutterBottom={{true}}
        >
          Indeterminate loader with label
        </AkTypography>

        <AkLoader 
          @size={{this.size}} 
          @thickness={{this.thickness}}
          @color={{this.color}}
        > 
          <:label>
            <AkTypography @variant="h6">
              {{this.label}}
            </AkTypography>
          </:label>
        </AkLoader>
      </div>

      <AkDivider />

      <div class="w-full">
        <AkTypography
          @variant='h5'
          @gutterBottom={{true}}
        >
          Determinate loader
        </AkTypography>

        <AkLoader 
          @variant="determinate"
          @size={{this.size}} 
          @thickness={{this.thickness}}
          @progress={{this.progress}}
          @color={{this.color}}
        />
      </div>

      <AkDivider />

      <div class="w-full">
        <AkTypography
          @variant='h5'
          @gutterBottom={{true}}
        >
          Determinate loader with label
        </AkTypography>

        <AkLoader 
          @variant="determinate"
          @size={{this.size}} 
          @thickness={{this.thickness}} 
          @progress={{this.progress}}
          @color={{this.color}}
        >
          <:label>
            <AkTypography @variant="h6">
              {{this.progress}}%
            </AkTypography>
          </:label>
        </AkLoader>
      </div>
    </AkStack>
  `,
  context: args,
});

export const Circular = Template.bind({});

Circular.args = {
  size: 100,
  thickness: 3,
  label: 'Label',
  progress: 22.5,
  color: 'primary',
};

const LinearTemplate = (args) => {
  return {
    template: hbs`
    <AkStack @direction='column' @spacing='2.5' @width='6/12'>

      <div class="w-full">
        <AkTypography
          @variant='h5'
          @gutterBottom={{true}}
        >
          Determinate Loader with label
        </AkTypography>

        <AkLoader::Linear
          @variant='determinate'
          @height={{this.height}}
          @progress={{this.progress}}
          @color={{this.color}}
        >
          <:label>
            <AkTypography @variant="h6">
              {{this.progress}}%
            </AkTypography>
          </:label>
        </AkLoader::Linear>
      </div>

      <AkDivider />

      <div class="w-full">
        <AkTypography
          @variant='h5'
          @gutterBottom={{true}}
        >
          Indeterminate Loader
        </AkTypography>

        <AkLoader::Linear @height={{this.height}} @color={{this.color}} />
      </div>
    </AkStack>
  `,
    context: args,
  };
};

export const Linear = LinearTemplate.bind({});

Linear.args = {
  height: 4,
  progress: 22.5,
  color: 'primary',
};
