import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkModal',
  component: 'ak-modal',
  excludeStories: ['actionsData'],
};

export const actionsData = {
  openModal: function () {
    this.set('showModal', true);
  },
  onClose: function () {
    this.set('showModal', false);
  },
};

const Template = (args) => ({
  template: hbs`
    {{!-- template-lint-disable no-action --}}
    <AkButton {{on 'click' (action this.openModal)}}>Open Modal</AkButton>

    {{#if this.showModal}}
        <AkModal
            @showHeader={{this.showHeader}}
            @headerTitle={{this.headerTitle}}
            @disableClose={{this.disableClose}}
            @disableOverlayClick={{this.disableOverlayClick}}
            @blurOverlay={{this.blurOverlay}}
            @onClose={{action this.onClose}}
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
  context: {
    ...args,
    ...actionsData,
  },
});

export const Default = Template.bind({});

Default.args = {
  showModal: false,
  showHeader: true,
  headerTitle: 'Greetings',
  disableClose: false,
  disableOverlayClick: false,
  blurOverlay: false,
};
