import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkList',
  component: 'ak-list',
  excludeStories: [],
};

const listData = [
  { label: 'Projects', icon: 'folder' },
  { label: 'Store Monitoring', icon: 'inventory-2' },
  { label: 'Analytics', icon: 'graphic-eq' },
  { label: 'Organization', icon: 'people' },
  { label: 'Settings', icon: 'account-box' },
];

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>Experiment with me</AkTypography>
    
    <div {{style backgroundColor="#f5f5f5"}} class="flex-row flex-align-center flex-justify-center p-3 w-full m-3">
        <div {{style backgroundColor="#ffffff"}} class="w-6/12">
            <AkList as |akl|>
                {{#each this.listData as |data idx|}}
                    <akl.listItem 
                        @button={{this.button}} 
                        @link={{this.link}} 
                        @noGutters={{this.noGutters}} 
                        @disabled={{this.disabled}} 
                        @selected={{this.selected}} as |li|>
                        <li.leftIcon>
                            <AkIcon @iconName={{data.icon}} />
                        </li.leftIcon>

                        <li.text @primaryText={{data.label}} />

                        {{#if (eq idx 0)}}
                            123
                        {{/if}}
                    </akl.listItem>
                {{/each}}
           </AkList>
        </div>
    </div>
  `,
  context: { ...args, listData },
});

export const Default = Template.bind({});

Default.args = {
  button: false,
  link: false,
  noGutters: false,
  selected: false,
  disabled: false,
  onClick: () => {},
};

const ButtonTemplate = (args) => ({
  template: hbs`
    <div {{style backgroundColor="#f5f5f5"}} class="flex-row flex-align-center flex-justify-center p-3 w-full m-3">
        <div {{style backgroundColor="#ffffff"}} class="w-6/12">
            <AkList as |akl|>
                {{#each this.listData as |data idx|}}
                    <akl.listItem @button={{true}} @disabled={{this.disabled}} @selected={{this.selected}} as |li|>
                        <li.leftIcon>
                            <AkIcon @iconName={{data.icon}} />
                        </li.leftIcon>

                        <li.text @primaryText={{data.label}} />

                        {{#if (eq idx 0)}}
                            123
                        {{/if}}
                    </akl.listItem>
                {{/each}}
           </AkList>
        </div>
    </div>
  `,
  context: { ...args, listData },
});

export const Button = ButtonTemplate.bind({});

Button.args = {
  selected: false,
  disabled: false,
};

const LinkTemplate = (args) => ({
  template: hbs`
    <div {{style backgroundColor="#f5f5f5"}} class="flex-row flex-align-center flex-justify-center p-3 w-full m-3">
        <div {{style backgroundColor="#ffffff"}} class="w-6/12">
            <AkList as |akl|>
                {{#each this.listData as |data idx|}}
                    <akl.listItem @link={{true}} @disabled={{this.disabled}} @selected={{this.selected}} as |li|>
                        <li.leftIcon>
                            <AkIcon @iconName={{data.icon}} />
                        </li.leftIcon>

                        <li.text @primaryText={{data.label}} />

                        {{#if (eq idx 0)}}
                            123
                        {{/if}}
                    </akl.listItem>
                {{/each}}
           </AkList>
        </div>
    </div>
  `,
  context: { ...args, listData },
});

export const Link = LinkTemplate.bind({});

Link.args = {
  selected: false,
  disabled: false,
};
