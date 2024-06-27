import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import styles from 'irene/components/ak-tabs/item/index.scss';

module('Integration | Component | ak-tabs/item', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.setProperties({
      id: 1,
      hidden: false,
      badgeCount: 9,
      hasBadge: true,
      label: 'Ak Tab',
      iconName: 'assignment',
      route: '/authenticated/active/route',
    });
  });

  test('it renders ak-tabs/item link with the right properties', async function (assert) {
    await render(hbs`
      <AkTabs::Item 
        @id={{this.id}}
        @hasBadge={{this.hasBadge}}
        @badgeCount={{this.badgeCount}}
        @route={{this.route}}
      > 
        {{this.label}}
      </AkTabs::Item>
    `);

    assert.dom('[data-test-ak-tab-item]').exists().containsText(this.label);
    assert.dom('[data-test-ak-tab-item] a').exists();
    assert.dom('[data-test-ak-tab-icon]').doesNotExist();

    assert
      .dom('[data-test-ak-tab-badge]')
      .exists()
      .containsText(`${this.badgeCount}`);
  });

  test('it renders ak-tabs/item button variant', async function (assert) {
    await render(hbs`
      <AkTabs::Item 
        @buttonVariant={{true}}
        @id={{this.id}}
        @hasBadge={{this.hasBadge}}
        @badgeCount={{this.badgeCount}}
        @route={{this.route}}
      > 
        {{this.label}}
      </AkTabs::Item>
    `);

    assert.dom('[data-test-ak-tab-item]').exists().containsText(this.label);
    assert.dom('[data-test-ak-tab-item] button').exists();
  });

  test('it renders icon passed to to ak-tabs/item tab', async function (assert) {
    this.set('isActive', true);

    await render(hbs`
      <AkTabs::Item
        @buttonVariant={{this.buttonVariant}}  
        @id={{this.id}}
        @hasBadge={{this.hasBadge}}
        @badgeCount={{this.badgeCount}}
        @isActive={{this.isActive}}
      > 
        <:tabIcon>
          <span data-test-tab-icon>{{this.iconName}}</span>
        </:tabIcon>

        <:default>
          {{this.label}}
        </:default>
      
      </AkTabs::Item>
    `);

    assert.dom('[data-test-ak-tab-item]').exists().containsText(this.label);
    assert.dom('[data-test-tab-icon]').exists().hasText(this.iconName);
  });

  test('it toggles badge vidibility in ak-tabs/item based on the "hasBadge" property', async function (assert) {
    this.set('hasBadge', false);

    await render(hbs`
      <AkTabs::Item
        @buttonVariant={{this.buttonVariant}}  
        @id={{this.id}}
        @hasBadge={{this.hasBadge}}
        @badgeCount={{this.badgeCount}}
      > 
        <:tabIcon>
          <span data-test-tab-icon>{{this.iconName}}</span>
        </:tabIcon>

        <:default>
          {{this.label}}
        </:default>
      
      </AkTabs::Item>
    `);

    assert.dom('[data-test-ak-tab-badge]').doesNotExist();

    this.set('hasBadge', true);

    await render(hbs`
      <AkTabs::Item
        @buttonVariant={{this.buttonVariant}}  
        @id={{this.id}}
        @hasBadge={{this.hasBadge}}
        @badgeCount={{this.badgeCount}}
      > 
        <:tabIcon>
          <span data-test-tab-icon>{{this.iconName}}</span>
        </:tabIcon>

        <:default>
          {{this.label}}
        </:default>
      
      </AkTabs::Item>
    `);

    assert
      .dom('[data-test-ak-tab-badge]')
      .exists()
      .containsText(`${this.badgeCount}`);
  });

  test('it applies active class to ak-tabs/item button tab if active', async function (assert) {
    this.setProperties({
      buttonVariant: true,
      isActive: true,
    });

    await render(hbs`
      <AkTabs::Item
        @buttonVariant={{this.buttonVariant}}  
        @id={{this.id}}
        @hasBadge={{this.hasBadge}}
        @badgeCount={{this.badgeCount}}
        @isActive={{this.isActive}}
      />
    `);

    assert
      .dom('[data-test-ak-tab-item] button')
      .exists()
      .hasClass(`${styles['active-line']}`);
  });

  test('it applies active shadow class to ak-tabs/item button tab if active', async function (assert) {
    this.setProperties({
      buttonVariant: true,
      isActive: true,
      indicatorVariant: 'shadow',
    });

    await render(hbs`
      <AkTabs::Item
        @buttonVariant={{this.buttonVariant}}  
        @id={{this.id}}
        @hasBadge={{this.hasBadge}}
        @badgeCount={{this.badgeCount}}
        @isActive={{this.isActive}}
        @indicatorVariant={{this.indicatorVariant}}
      />
    `);

    assert
      .dom('[data-test-ak-tab-item] button')
      .exists()
      .hasClass(`${styles['active-shadow']}`);
  });

  test('it triggers click callback passed to ak-tabs/item button with the right arguments', async function (assert) {
    assert.expect(2);

    this.setProperties({
      buttonVariant: true,
      onTabClick: function (id) {
        assert.ok(true, 'Callback was triggered');
        assert.strictEqual(
          this.id,
          id,
          'The callback receives the right arguments.'
        );
      },
    });

    await render(hbs`
      <AkTabs::Item
        @buttonVariant={{this.buttonVariant}}  
        @id={{this.id}}
        @hasBadge={{this.hasBadge}}
        @badgeCount={{this.badgeCount}}
        @onTabClick={{this.onTabClick}}
      />
    `);

    await click('[data-test-ak-tab-item] button');
  });

  test('it renders custom badge content when using named block', async function (assert) {
    await render(hbs`
      <AkTabs::Item
        @id={{this.id}}
        @route={{this.route}}
        @hasBadge={{this.hasBadge}}
      >
        <:badge>
          Custom Badge
        </:badge>
        
        <:default>{{this.label}}</:default>
      </AkTabs::Item>
    `);

    assert
      .dom('[data-test-ak-tab-badge]')
      .exists()
      .containsText('Custom Badge');
  });

  test.each(
    'it renders badge content with/without background',
    ['', false, true],
    async function (assert, badgeBackground) {
      this.set('badgeBackground', badgeBackground);

      const hasBadgeBackground = badgeBackground ?? true;

      await render(hbs`
      <AkTabs::Item
        @id={{this.id}}
        @route={{this.route}}
        @hasBadge={{this.hasBadge}}
        @badgeBackground={{this.badgeBackground}}
      >
        {{this.label}}
      </AkTabs::Item>
    `);

      assert
        .dom('[data-test-ak-tab-badge]')
        .exists()
        [hasBadgeBackground ? 'hasClass' : 'doesNotHaveClass'](
          /ak-tab-badge-background/
        );
    }
  );
});
