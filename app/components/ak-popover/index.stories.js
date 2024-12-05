import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkPopover',
  component: 'ak-popover',
  excludeStories: [],
};

function handleMoreClick(event) {
  this.set('anchorRef', event.currentTarget);
}

function handleClose() {
  this.set('anchorRef', null);
}

const styles = {
  container: {
    width: 'max-content',
    background: '#fff',
    border: '1px solid #e9e9e9',
    boxShadow: '4px 4px 10px 0px rgba(0, 0, 0, 0.15)',
    margin: '0.8em',
  },
};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>Experiment with me</AkTypography>
    
    <AkIconButton @variant="outlined" {{on 'click' this.handleMoreClick}}>
        <AkIcon @iconName="more-vert" />
    </AkIconButton>

    <AkPopover 
      @renderInPlace={{this.renderInPlace}}
      @placement={{this.placement}}
      @modifiers={{this.modifiers}}
      @anchorRef={{this.anchorRef}} 
      @arrow={{this.arrow}} 
      @arrowColor={{this.arrowColor}}
      @hasBackdrop={{this.hasBackdrop}} 
      @onBackdropClick={{this.handleClose}}
      @clickOutsideToClose={{this.clickOutsideToClose}}
      @closeHandler={{this.handleClose}}
      >
        <div {{style this.styles.container}} class="p-2">
            <AkTypography>I am inside a popover</AkTypography>
        </div>
    </AkPopover>
  `,
  context: { ...args, styles },
});

export const Default = Template.bind({});

Default.args = {
  renderInPlace: false,
  placement: 'auto',
  modifiers: [],
  anchorRef: null,
  arrow: false,
  arrowColor: 'light',
  hasBackdrop: true,
  clickOutsideToClose: false,
  handleClose: action(handleClose),
  handleMoreClick: action(handleMoreClick),
};
