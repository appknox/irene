import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, render } from '@ember/test-helpers';

module(
  'Integration | Component | storeknox/fake-apps/findings-signal-row',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.signal = {
        title: 'Logo Analysis',
        result: 'Strong Match',
        resultLevel: 'high',
        description: 'Logos are identical.',
        numericScore: 0.9,
      };
      this.onClick = () => {};
    });

    test('it renders signal title and result', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::FindingsSignalRow
          @signal={{this.signal}}
          @onClick={{this.onClick}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsSignalRow-title]')
        .hasText('Logo Analysis');

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsSignalRow-result]')
        .hasText('Strong Match');
    });

    test('it calls onClick when the expand button is clicked', async function (assert) {
      assert.expect(1);

      this.onClick = () => assert.ok(true, 'onClick called');

      await render(hbs`
        <Storeknox::FakeApps::FindingsSignalRow
          @signal={{this.signal}}
          @onClick={{this.onClick}}
        />
      `);

      await click('[data-test-storeknoxFakeAppsFindingsSignalRow-expandBtn]');
    });

    test('it applies result-high CSS class for high result level', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::FindingsSignalRow
          @signal={{this.signal}}
          @onClick={{this.onClick}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsSignalRow-result]')
        .hasClass(/result-high/);
    });

    test('it applies result-medium CSS class for medium result level', async function (assert) {
      this.signal = {
        ...this.signal,
        result: 'Partial Match',
        resultLevel: 'medium',
        numericScore: 0.7,
      };

      await render(hbs`
        <Storeknox::FakeApps::FindingsSignalRow
          @signal={{this.signal}}
          @onClick={{this.onClick}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsSignalRow-result]')
        .hasClass(/result-medium/);
    });

    test('it applies result-low CSS class for low result level', async function (assert) {
      this.signal = {
        ...this.signal,
        title: 'Package Analysis',
        result: 'Low Match',
        resultLevel: 'low',
        numericScore: 0.2,
      };

      await render(hbs`
        <Storeknox::FakeApps::FindingsSignalRow
          @signal={{this.signal}}
          @onClick={{this.onClick}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsSignalRow-result]')
        .hasClass(/result-low/);
    });
  }
);
