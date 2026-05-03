import { hbs } from 'ember-cli-htmlbars';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default {
  title: 'AkClipboard',
  component: 'ak-clipboard',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>
        Experiment with me
    </AkTypography>

    <AkClipboard @id={{this.id}} @onSuccess={{this.onSuccess}} @onError={{this.onError}} as |cb|>
      <AkButton data-clipboard-text="I am copied!" id={{cb.triggerId}}>
        Copy Me
      </AkButton>
    </AkClipboard>
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  id: '',
  onSuccess: (event) => {
    alert(`${event.text} is successfull.`);
  },
  onError: (event) => {
    alert(`${event.action} errored.`);
  },
};

class WithTargetContext {
  id = '';

  @tracked textToCopy = 'I will be copied!';

  @action
  updateTextToCopy(event) {
    this.textToCopy = event.target.value;
  }

  @action
  onSuccess(event) {
    alert(`${event.text} is successfull.`);
  }

  @action
  onError(event) {
    alert(`${event.action} errored.`);
  }
}

const WithTargetTemplate = () => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>
        Experiment with me
    </AkTypography>

    <AkTextField
      id="copy-input"
      @value={{this.textToCopy}}
      {{on 'input' this.updateTextToCopy}}
    />

    <AkClipboard @id={{this.id}} @onSuccess={{this.onSuccess}} @onError={{this.onError}} as |cb|>
      <AkButton class="mt-2" data-clipboard-target="#copy-input" id={{cb.triggerId}}>
        Copy Input text
      </AkButton>
    </AkClipboard>
  `,
  context: new WithTargetContext(),
});

export const WithTarget = WithTargetTemplate.bind({});
