import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkModal',
  component: 'ak-modal',
  excludeStories: ['actionsData'],
};

function openModal() {
  this.set('showModal', true);
}

function onClose() {
  this.set('showModal', false);
}

const Template = (args) => ({
  template: hbs`
    <AkButton {{on 'click' this.handleOpenModal}}>Open Modal</AkButton>

    {{#if this.showModal}}
        <AkModal
            @showHeader={{this.showHeader}}
            @headerTitle={{this.headerTitle}}
            @disableClose={{this.disableClose}}
            @disableOverlayClick={{this.disableOverlayClick}}
            @blurOverlay={{this.blurOverlay}}
            @onClose={{this.handleClose}}
            >
            <div class='flex-column flex-align-center flex-justify-center'>
                <AkTypography>
                    Hey there, I am inside a modal
                </AkTypography>

                <div class='flex-row flex-align-center flex-justify-center mt-3'>
                    <AkButton>OK</AkButton>

                    <AkButton
                        class='ml-2'
                        @variant='outlined'
                        @color='neutral'
                    >
                        Cancel
                    </AkButton>
                </div>
            </div>
        </AkModal>
    {{/if}}
  `,
  context: { ...args },
});

export const Default = Template.bind({});

Default.args = {
  showModal: false,
  showHeader: true,
  headerTitle: 'Greetings',
  disableClose: false,
  disableOverlayClick: false,
  blurOverlay: false,
  handleOpenModal: action(openModal),
  handleClose: action(onClose),
};
