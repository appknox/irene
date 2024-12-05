import { hbs } from 'ember-cli-htmlbars';
import { action } from '@ember/object';

export default {
  title: 'AkDrawer',
  component: 'ak-drawer',
  excludeStories: [],
};

function handleOpen() {
  this.set('open', true);
}

function handleClose() {
  this.set('open', false);
}

const Template = (args) => {
  return {
    template: hbs`
        <AkButton {{on 'click' this.handleOpen}}>
            Open drawer
        </AkButton>

        <AkDrawer 
            @anchor={{this.anchor}} 
            @open={{this.open}} 
            @disableBackdropClick={{this.disableBackdropClick}} 
            @onClose={{this.handleClose}}>
                <div {{style (hash width="250px")}} />
        </AkDrawer>
  `,
    context: { ...args },
  };
};

export const Basic = Template.bind({});

Basic.args = {
  open: false,
  anchor: 'left',
  disableBackdropClick: false,
  handleOpen: action(handleOpen),
  handleClose: action(handleClose),
};
