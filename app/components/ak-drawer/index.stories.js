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
    init() {
      this._super(...arguments);
      this.boundHandleOpen = this.handleOpen.bind(this);
      this.boundHandleClose = this.handleClose.bind(this);
    },
  };

  return {
    template: hbs`
        <AkButton {{on 'click' this.boundHandleOpen}}>
            Open drawer
        </AkButton>

        <AkDrawer 
            @anchor={{this.anchor}} 
            @open={{this.open}} 
            @disableBackdropClick={{this.disableBackdropClick}} 
            @onClose={{this.boundHandleClose}}>
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
