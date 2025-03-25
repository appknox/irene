import { action, computed } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkTabs',
  component: 'ak-tabs',
  excludeStories: [],
};

function onTabClick(tabId) {
  this.set('activeTab', tabId);
}

const commonArgs = {
  buttonVariant: true,
  activeTab: 1,
  currentTabDetails: computed('activeTab', 'tabItems', function () {
    return this.tabItems.find((tab) => tab.id === this.activeTab);
  }),
  indicatorVariant: 'line',
  tabItems: [
    {
      id: 1,
      hidden: false,
      badgeCount: 9,
      hasBadge: true,
      label: 'Tab One',
      iconName: 'assignment',
      isActive: true,
    },
    {
      id: 2,
      hidden: false,
      badgeCount: 100,
      hasBadge: true,
      label: 'Tab Two',
      iconName: 'group',
    },
  ],
  onTabClick: action(onTabClick),
};

const Template = (args) => ({
  template: hbs`
    <div {{style backgroundColor="#f5f5f5"}} class="flex-row flex-align-center w-full mt-3">
        <div {{style backgroundColor="#ffffff"}} class="w-full">
          <AkTabs as |Akt|>
            {{#each this.tabItems as |item|}}
              <Akt.tabItem
                @hidden={{item.hidden}}
                @id={{item.id}}
                @hasBadge={{item.hasBadge}}
                @badgeCount={{item.badgeCount}}
                @isActive={{eq this.activeTab item.id}}
                @buttonVariant={{this.buttonVariant}}
                @onTabClick={{this.onTabClick}}
                @indicatorVariant={{this.indicatorVariant}}
              >
                <:tabIcon>
                  <AkIcon
                    @iconName={{item.iconName}}
                    {{style fontSize='1.29rem !important'}}
                  />
                </:tabIcon>
          
                <:default>
                  {{item.label}}
                </:default>
              </Akt.tabItem>
            {{/each}}
            </AkTabs>
            
            <div class="flex-column p-3">
            {{#unless this.buttonVariant}}
              <span class="pb-1">-<span class="bold"> N/B:</span> The link variant works with the ember routing system so it technically won't work here.</span>
            {{/unless}}
              <div class="flex-row pb-1">- This is the content for <AkTypography @color="success" @underline="always" class="ml-1 bold">{{this.currentTabDetails.label}}</AkTypography> </div>
              <span class="pb-1">- Tab Type: <span class="bold">{{if this.buttonVariant "Button" "Link"}}</span>  (Toggle "buttonVariant" property to see effect)</span>
            </div>
        </div>
    </div>
  `,
  context: { ...args },
});

// For the Button variant
export const ButtonVariant = Template.bind({});
ButtonVariant.args = commonArgs;

// For the Link Variant
export const LinkVariant = Template.bind({});
LinkVariant.args = { ...commonArgs, buttonVariant: false };

// For Custom Badge Content
export const CustomBadgeContent = (args) => ({
  template: hbs`
    <div {{style backgroundColor="#f5f5f5"}} class="flex-row flex-align-center w-full mt-3">
      <div {{style backgroundColor="#ffffff"}} class="w-full">
        <AkTabs as |Akt|>
          {{#each this.tabItems as |item|}}
            <Akt.tabItem
              @hidden={{item.hidden}}
              @id={{item.id}}
              @hasBadge={{item.hasBadge}}
              @badgeBackground={{this.badgeBackground}}
              @isActive={{eq this.activeTab item.id}}
              @buttonVariant={{this.buttonVariant}}
              @onTabClick={{this.onTabClick}}
              @indicatorVariant={{this.indicatorVariant}}
            >
              <:tabIcon>
                <AkIcon
                  @iconName={{item.iconName}}
                  {{style fontSize='1.29rem !important'}}
                />
              </:tabIcon>
        
              <:badge>
                <AkIcon @iconName='add' @size='small' /> {{item.badgeCount}} 
              </:badge>
              
              <:default>
                {{item.label}}
              </:default>
            </Akt.tabItem>
          {{/each}}
        </AkTabs>
        
        <div class="flex-column p-3">
          {{#unless this.buttonVariant}}
            <span class="pb-1">-<span class="bold"> N/B:</span> The link variant works with the ember routing system so it technically won't work here.</span>
          {{/unless}}
          <div class="flex-row pb-1">- This is the content for <AkTypography @color="success" @underline="always" class="ml-1 bold">{{this.currentTabDetails.label}}</AkTypography> </div>
          <span class="pb-1">- Tab Type: <span class="bold">{{if this.buttonVariant "Button" "Link"}}</span>  (Toggle "buttonVariant" property to see effect)</span>
        </div>
      </div>
    </div>
  `,
  context: { ...args },
});

CustomBadgeContent.args = {
  ...commonArgs,
  badgeBackground: true,
};
