import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkToggle',
  component: 'ak-toggle',
  excludeStories: [],
};

const actions = {
  handleClick(event) {
    console.log('click event!', event);
  },
  handleChange(event, checked) {
    console.log('change event!', { event, checked });
  },
};

const Template = (args) => ({
  template: hbs`
    <AkToggle
      @checked={{this.checked}}
      @size={{this.size}}
      @disabled={{this.disabled}}
      @readonly={{this.readonly}}
      @onClick={{this.handleClick}}
      @onChange={{this.handleChange}} />
  `,
  context: { ...args, ...actions },
});

export const Basic = Template.bind({});

Basic.args = {
  disabled: false,
  readonly: false,
  checked: false,
  size: 'small',
};

const LabelTemplate = (args) => ({
  template: hbs`
    <AkFormControlLabel @label={{this.label}} @disabled={{this.disabled}} as |fcl|>
      <AkToggle
        @checked={{this.checked}}
        @size={{this.size}}
        @disabled={{fcl.disabled}}
        @readonly={{this.readonly}}
        @onClick={{this.handleClick}}
        @onChange={{this.handleChange}} />
    </AkFormControlLabel>
  `,
  context: { ...args, ...actions },
});

export const Label = LabelTemplate.bind({});

Label.args = {
  label: 'Check me',
  disabled: false,
  readonly: false,
  checked: true,
  size: 'small',
};

const SizesTemplate = (args) => ({
  template: hbs`
    <AkToggle
      @checked={{this.checked}}
      @size="small"
      @disabled={{this.disabled}}
      @readonly={{this.readonly}}
      @onClick={{this.handleClick}}
      @onChange={{this.handleChange}} />

    <AkToggle
      @checked={{this.checked}}
      @disabled={{this.disabled}}
      @readonly={{this.readonly}}
      @onClick={{this.handleClick}}
      @onChange={{this.handleChange}} />

    <AkToggle
      @checked={{this.checked}}
      @size="large"
      @disabled={{this.disabled}}
      @readonly={{this.readonly}}
      @onClick={{this.handleClick}}
      @onChange={{this.handleChange}} />
  `,
  context: { ...args, ...actions },
});

export const Sizes = SizesTemplate.bind({});

Sizes.args = {
  disabled: false,
  readonly: false,
  checked: false,
};
