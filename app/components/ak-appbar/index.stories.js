import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkAppbar',
  component: 'ak-appbar',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkAppbar 
      @color={{this.color}} 
      @elevation={{this.elevation}} 
      @position={{this.position}} 
      @placement={{this.placement}}
      @direction={{this.direction}}
      @alignItems={{this.alignItems}}
      @gutter={{this.gutter}}
      @justifyContent={{this.justifyContent}}
      @spacing={{this.spacing}} as |ab|>
        <AkTypography @variant="h5" @color="inherit">
            Appbar title
        </AkTypography>

        <AkIconButton class={{ab.classes.defaultIconBtn}}>
            <AkIcon @iconName="close" />
        </AkIconButton>
      </AkAppbar>
  `,
  context: { ...args },
});

export const Basic = Template.bind({});

Basic.args = {
  color: 'inherit',
  elevation: false,
  position: 'static',
  placement: 'top',
  direction: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gutter: true,
  spacing: 0,
};
