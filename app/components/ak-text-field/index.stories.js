import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkTextField',
  component: 'ak-text-field',
  excludeStories: ['actionsData'],
};

export const actionsData = {};

const Template = (args) => ({
  template: hbs`
    <AkTextField 
      @type={{this.type}}
      @label={{this.label}} 
      @placeholder={{this.placeholder}}
      @value={{this.value}}
      @helperText={{this.helperText}}
      @disabled={{this.disabled}}
      @readonly={{this.readonly}}
      @autofocus={{this.autofocus}}
      @required={{this.required}}
      @error={{this.error}} />
    
    <div class="flex-row flex-row-gap-3 mt-1">
      <AkTextField @placeholder="Without label" />
      <AkTextField @placeholder="Without label has value" @value="Hello world" />
    </div>

    <div class="flex-row flex-row-gap-3 mt-1">
      <AkTextField @label="Helper Text" @placeholder="Enter something" @helperText="I am an helper text" />
      <AkTextField @label="Helper Text Error State" @placeholder="Enter something" @helperText="I am an helper text in error state" @error={{true}} />
    </div>

    <div class="flex-row flex-row-gap-3 mt-1">
      <AkTextField @label="Disabled" @placeholder="Enter something" @disabled={{true}} />
      <AkTextField @label="Disabled with value" @placeholder="Enter something" @value="I am disabled" @disabled={{true}} />
    </div>

    <div class="flex-row flex-row-gap-3 mt-1">
      <AkTextField @label="Readonly" @placeholder="Enter something" @readonly={{true}} />
      <AkTextField @label="Readonly with value" @placeholder="Enter something" @value="I am readonly" @readonly={{true}} />
    </div>

    <div class="flex-row flex-row-gap-3 mt-1">
      <AkTextField @label="Required" @placeholder="Enter something" @required={{true}} />
      <AkTextField @label="Password" @placeholder="Enter password" @type="password" />
    </div>
  `,
  context: args,
});

export const Basic = Template.bind({});

Basic.args = {
  type: '',
  label: 'Experiment with me',
  placeholder: 'Enter something',
  value: '',
  helperText: '',
  readonly: false,
  disabled: false,
  error: false,
  autofocus: true,
  required: false,
  ...actionsData,
};

const WithIconTemplate = (args) => ({
  template: hbs`
    <AkTextField 
      @type={{this.type}}
      @label={{this.label}} 
      @placeholder={{this.placeholder}}
      @value={{this.value}}
      @helperText={{this.helperText}}
      @disabled={{this.disabled}}
      @readonly={{this.readonly}}
      @autofocus={{this.autofocus}}
      @error={{this.error}}> 
        <:leftAdornment>
          <span class="ak-icon ak-icon-credit-card"></span>
        </:leftAdornment>

        <:rightAdornment>
          <span class="ak-icon ak-icon-close"></span>
        </:rightAdornment>
    </AkTextField>

    <div class="flex-row flex-row-gap-3 mt-1">
      <AkTextField @placeholder="Only left adornment">
        <:leftAdornment>
          <span>$</span>
        </:leftAdornment>
      </AkTextField>

      <AkTextField @value="Only right adornment">
        <:rightAdornment>
          <span class="ak-icon ak-icon-close"></span>
        </:rightAdornment>
      </AkTextField>
    </div>
  `,
  context: args,
});

export const WithIcon = WithIconTemplate.bind({});

WithIcon.args = {
  type: '',
  label: 'Experiment with me',
  placeholder: 'Enter something',
  value: '',
  helperText: '',
  readonly: false,
  disabled: false,
  error: false,
  autofocus: true,
  ...actionsData,
};

function handleChange(event) {
  this.set('value', event.target.value);
}

const actions = {
  handleChange: action(handleChange),
  handleBlur(event) {
    alert(event.target.value);
  },
};

const EventedTemplate = (args) => {
  return {
    template: hbs`
    <AkTextField 
      @label={{this.label}} 
      @placeholder={{this.placeholder}}
      @value={{this.value}}
      {{on 'change' this.handleChange}}
      {{on 'blur' this.handleBlur}}> 
    </AkTextField>
  `,
    context: { ...args, ...actions },
  };
};

export const WithEvent = EventedTemplate.bind({});

WithEvent.args = {
  label: 'Type something and click outside to see alert',
  placeholder: 'Enter something',
  value: '',
  ...actionsData,
};
