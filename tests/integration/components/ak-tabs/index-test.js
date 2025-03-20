import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-tabs', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.setProperties({
      buttonVariant: true,
      activeTab: 1,

      tabItems: [
        {
          id: 1,
          hidden: false,
          badgeCount: 9,
          hasBadge: true,
          label: 'Tab One',
          iconName: 'assignment',
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
    });
  });

  test('it renders ak-tabs with one tab item', async function (assert) {
    await render(hbs`
      <AkTabs as |Akt|>
        <Akt.tabItem
          @buttonVariant={{true}}
          @id="tab-item"
          @hasBadge={{true}}
          @badgeCount={{9}}
          @isActive={{true}}
        >
          <:tabIcon>
            <span data-test-tab-icon>{{this.iconName}}</span>
          </:tabIcon>

          <:default>
            Tab item
          </:default>
        </Akt.tabItem>
      </AkTabs>
    `);

    assert.dom('[data-test-ak-tabs-container]').exists();
    assert.dom('[data-test-ak-tab-list-wrapper]').exists();
    assert.dom('[data-test-tab-icon]').exists();
    assert.dom('[data-test-ak-tab-item]').exists().hasAnyText('Tab item');
  });

  test('it renders the correct number of tabs with the right data', async function (assert) {
    await render(hbs`
      <AkTabs as |Akt|>
        {{#each this.tabItems as |item|}}
          <Akt.tabItem
            @buttonVariant={{true}}
            @id={{item.id}}
            @hasBadge={{item.hasBadge}}
            @badgeCount={{item.badgeCount}}
            @isActive={{eq this.activeTab item.id}}
            data-test-tab-item="tab-{{item.id}}"
          >
            <:tabIcon>
              <span data-test-tab-icon>{{item.iconName}}</span>
            </:tabIcon>

            <:default>
              Tab item {{item.id}}
            </:default>
          </Akt.tabItem>
        {{/each}}
      </AkTabs>
    `);

    assert.ok(true);

    const allTabItems = findAll('[data-test-tab-item]');

    assert.strictEqual(
      this.tabItems.length,
      allTabItems.length,
      'Renders correct number of tabs.'
    );

    for (let i = 0; i < allTabItems.length; i++) {
      const tab = this.tabItems[i];
      assert
        .dom(`[data-test-tab-item="tab-${tab.id}"]`)
        .exists()
        .hasTextContaining(`Tab item ${tab.id}`);
      assert
        .dom(`[data-test-tab-item="tab-${tab.id}"] [data-test-tab-icon]`)
        .exists()
        .hasText(tab.iconName);
      assert
        .dom(`[data-test-tab-item="tab-${tab.id}"] [data-test-ak-tab-badge]`)
        .exists()
        .hasText(`${tab.badgeCount}`);
    }
  });

  test('it changes active tab when an inactive tab is clicked on ', async function (assert) {
    this.set('currentTabDetails', this.tabItems[0]);

    this.set('onTabClick', (tabId) => {
      this.set('activeTab', tabId);
      this.currentTabDetails = this.tabItems.find(
        (tab) => tab.id === this.activeTab
      );
    });

    await render(hbs`
      <AkTabs as |Akt|>
        {{#each this.tabItems as |item|}}
          <Akt.tabItem
            @buttonVariant={{true}}
            @id={{item.id}}
            @hasBadge={{item.hasBadge}}
            @badgeCount={{item.badgeCount}}
            @isActive={{eq this.activeTab item.id}}
            @onTabClick={{this.onTabClick}}
            data-test-tab-item="tab-{{item.id}}"
          >
            <:tabIcon>
              <span data-test-tab-icon>{{this.iconName}}</span>
            </:tabIcon>

            <:default>
              Tab item
            </:default>
          </Akt.tabItem>
        {{/each}}
      </AkTabs>
    `);

    assert.dom('[data-test-ak-tabs-container]').exists();
    assert.dom('[data-test-ak-tab-list-wrapper]').exists();

    assert.strictEqual(
      this.currentTabDetails.id,
      this.activeTab,
      `Current active tab has an id of ${this.activeTab}`
    );

    assert
      .dom(`[data-test-tab-item="tab-${this.currentTabDetails.id}"] button`)
      .hasClass(/_active-line_/i);

    const tabIdToBeClicked = 2;
    await click(`[data-test-tab-item="tab-${tabIdToBeClicked}"] button`);

    assert.strictEqual(
      this.currentTabDetails.id,
      tabIdToBeClicked,
      `Active tab was updated to tab with id of ${tabIdToBeClicked}`
    );

    assert
      .dom(`[data-test-tab-item="tab-${this.currentTabDetails.id}"] button`)
      .hasClass(/_active-line_/i);
  });
});
