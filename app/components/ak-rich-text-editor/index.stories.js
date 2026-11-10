import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkRichTextEditor',
  component: 'ak-rich-text-editor',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>
        Experiment with me
    </AkTypography>

    <AkRichTextEditor
      @value={{this.value}}
      @placeholder={{this.placeholder}}
      @disabled={{this.disabled}}
    />
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  value: '<p>Start typing to see the toolbar react.</p>',
  placeholder: 'Add a description',
  disabled: false,
};

export const Empty = Template.bind({});

Empty.args = {
  value: '',
  placeholder: 'Add a description',
  disabled: false,
};

export const Disabled = Template.bind({});

Disabled.args = {
  value: '<p>This editor is read only.</p>',
  placeholder: 'Add a description',
  disabled: true,
};
