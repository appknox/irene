import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-orgSettingsPanelHeader]',
  icon: '[data-test-orgSettingsPanelHeader-icon]',
  iconSymbol: '[data-test-orgSettingsPanelHeader-icon] [data-test-ak-icon]',
  titleColumn: '[data-test-orgSettingsPanelHeader-titleColumn]',
  description: '[data-test-orgSettingsPanelHeader-description]',
  action: '[data-test-orgSettingsPanelHeader-action]',
  yieldedTitle: '[data-test-panelHeaderTitle]',
  yieldedAction: '[data-test-panelHeaderAction]',
};

// ─── Test suite ────────────────────────────────────────────────────────────────
module(
  'Integration | Component | organization/settings-panel-header',
  function (hooks) {
    setupRenderingTest(hooks);

    // ─── Description ───────────────────────────────────────────────────────────
    test('it renders the description when one is passed', async function (assert) {
      await render(hbs`
        <Organization::SettingsPanelHeader @description='Upload your certificate'>
          <:title>
            <span data-test-panelHeaderTitle>Signing certificate</span>
          </:title>
        </Organization::SettingsPanelHeader>
      `);

      assert
        .dom(selectors.description)
        .hasText('Upload your certificate', 'renders the description copy');

      assert.strictEqual(
        findAll(`${selectors.titleColumn} > *`).length,
        2,
        'the title column holds the title and the description'
      );
    });

    // ─── Icon ──────────────────────────────────────────────────────────────────
    test('it renders the icon tile only when @iconName is passed', async function (assert) {
      await render(hbs`<Organization::SettingsPanelHeader @description='x' />`);

      assert
        .dom(selectors.icon)
        .doesNotExist('omitting @iconName gives a plain text header');

      await render(
        hbs`<Organization::SettingsPanelHeader @iconName='devices' @description='x' />`
      );

      assert
        .dom(selectors.iconSymbol)
        .hasAttribute('icon', new RegExp('devices'));

      assert
        .dom(selectors.icon)
        .hasAttribute(
          'aria-hidden',
          'true',
          'the tile is decorative, so it is hidden from assistive tech'
        );
    });

    // ─── Named blocks ──────────────────────────────────────────────────────────
    test('it yields the title and action blocks', async function (assert) {
      await render(hbs`
        <Organization::SettingsPanelHeader @description='Desc'>
          <:title>
            <span data-test-panelHeaderTitle>Panel title</span>
          </:title>

          <:action>
            <button type='button' data-test-panelHeaderAction>Add</button>
          </:action>
        </Organization::SettingsPanelHeader>
      `);

      assert.dom(selectors.yieldedTitle).hasText('Panel title');

      assert
        .dom(selectors.yieldedAction, find(selectors.action))
        .hasText('Add', 'the action block renders inside the action container');
    });

    test('it renders with neither block supplied', async function (assert) {
      await render(
        hbs`<Organization::SettingsPanelHeader @description='Desc' />`
      );

      assert.dom(selectors.root).exists();
      assert.dom(selectors.description).hasText('Desc');
      assert
        .dom(selectors.action)
        .hasNoText('the action container stays empty');
    });

    // ─── Attributes ────────────────────────────────────────────────────────────
    test('it forwards attributes onto its root element', async function (assert) {
      await render(
        hbs`<Organization::SettingsPanelHeader class='custom-header' @description='Desc' />`
      );

      assert.dom(selectors.root).hasClass('custom-header');

      assert
        .dom(selectors.root)
        .hasClass(
          /ak-stack-width-full/,
          'the forwarded class does not displace the stack width class'
        );

      assert.dom(selectors.root).hasAttribute('data-test-ak-stack');
    });
  }
);
