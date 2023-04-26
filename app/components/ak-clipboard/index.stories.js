import { hbs } from 'ember-cli-htmlbars';

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

const WithTargetTemplate = (args) => ({
  template: hbs`
    <AkTextField id="copy-input" value="I will be copied!" />

    <AkClipboard @id={{this.id}} @onSuccess={{this.onSuccess}} @onError={{this.onError}} as |cb|>
      <AkButton class="mt-2" data-clipboard-target="#copy-input" id={{cb.triggerId}}>
        Copy Input text
      </AkButton>
    </AkClipboard>
  `,
  context: args,
});

export const WithTarget = WithTargetTemplate.bind({});

WithTarget.args = {
  id: '',
  onSuccess: (event) => {
    alert(`${event.text} is successfull.`);
  },
  onError: (event) => {
    alert(`${event.action} errored.`);
  },
};
