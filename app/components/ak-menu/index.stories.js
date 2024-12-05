import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkMenu',
  component: 'ak-menu',
  excludeStories: [],
};

function handleMoreClick(event) {
  this.set('anchorRef', event.currentTarget);
}

function handleClose() {
  this.set('anchorRef', null);
}

const commonActionArgs = {
  handleMoreClick: action(handleMoreClick),
  handleClose: action(handleClose),
};

const menuData = [
  { label: 'Add Project', icon: 'note-add', divider: true },
  { label: 'Add Member', icon: 'group-add', divider: true },
  { label: 'Delete', icon: 'delete', divider: false },
];

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>Experiment with me</AkTypography>
    
    <AkIconButton @variant="outlined" {{on 'click' this.handleMoreClick}}>
        <AkIcon @iconName="more-vert" />
    </AkIconButton>

    <AkMenu @arrow={{this.arrow}} @anchorRef={{this.anchorRef}} @onClose={{this.handleClose}} as |akm|>
        {{#each this.menuData as |data|}}
            <akm.listItem @onClick={{this.handleClose}} @divider={{data.divider}}>
                <AkTypography>{{data.label}}</AkTypography>
            </akm.listItem>
        {{/each}}
    </AkMenu>
  `,
  context: { ...args, menuData },
});

export const Default = Template.bind({});

Default.args = {
  anchorRef: null,
  arrow: false,
  ...commonActionArgs,
};

const WithIconsTemplate = (args) => ({
  template: hbs`
    <AkIconButton @variant="outlined" {{on 'click' this.handleMoreClick}}>
        <AkIcon @iconName="more-vert" />
    </AkIconButton>

    <AkMenu @arrow={{this.arrow}} @anchorRef={{this.anchorRef}} @onClose={{this.handleClose}} as |akm|>
        {{#each this.menuData as |data|}}
            <akm.listItem @onClick={{this.handleClose}} @divider={{data.divider}} as |li|>
                <li.leftIcon>
                    <AkIcon @size="small" @iconName={{data.icon}} />
                </li.leftIcon>

                <li.text @primaryText={{data.label}} />
            </akm.listItem>
        {{/each}}
    </AkMenu>
  `,
  context: { ...args, menuData },
});

export const WithIcons = WithIconsTemplate.bind({});

WithIcons.args = {
  anchorRef: null,
  arrow: false,
  ...commonActionArgs,
};

const DisabledTemplate = (args) => ({
  template: hbs`
    <AkIconButton @variant="outlined" {{on 'click' this.handleMoreClick}}>
        <AkIcon @iconName="more-vert" />
    </AkIconButton>

    <AkMenu @arrow={{this.arrow}} @anchorRef={{this.anchorRef}} @onClose={{this.handleClose}} as |akm|>
        <akm.listItem @disabled={{this.disabled}} @onClick={{this.handleClose}} @divider={{true}} as |li|>
            <li.leftIcon>
                <AkIcon @iconName="done" @size="small" />
            </li.leftIcon>

            <li.text @primaryText="Approve" />
        </akm.listItem>

        {{#each this.menuData as |data|}}
            <akm.listItem @onClick={{this.handleClose}} @divider={{data.divider}} as |li|>
                <li.leftIcon>
                  <AkIcon @iconName={{data.icon}} @size="small" />
                </li.leftIcon>

                <li.text @primaryText={{data.label}} />
            </akm.listItem>
        {{/each}}
    </AkMenu>
  `,
  context: { ...args, menuData },
});

export const Disabled = DisabledTemplate.bind({});

Disabled.args = {
  anchorRef: null,
  disabled: true,
  arrow: false,
  ...commonActionArgs,
};
