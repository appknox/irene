import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkDrawer',
  component: 'ak-drawer',
  excludeStories: [],
};

const Template = (args) => {
  const actions = {
    handleOpen() {
      this.set('open', true);
    },
    handleClose() {
      this.set('open', false);
    },
  };

  return {
    template: hbs`
        {{!-- template-lint-disable no-action --}}
        <AkButton {{on 'click' (action this.handleOpen)}}>
            Open drawer
        </AkButton>

        <AkDrawer 
            @anchor={{this.anchor}} 
            @open={{this.open}} 
            @disableBackdropClick={{this.disableBackdropClick}} 
            @onClose={{action this.handleClose}}>
                <div {{style (hash width="250px")}} />
        </AkDrawer>
  `,
    context: { ...args, ...actions },
  };
};

export const Basic = Template.bind({});

Basic.args = {
  open: false,
  anchor: 'left',
  disableBackdropClick: false,
};
