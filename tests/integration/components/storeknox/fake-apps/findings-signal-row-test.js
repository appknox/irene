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

    test('it renders signal title and result', async function (assert) {
      this.signal = {
        title: 'Logo Analysis',
        result: 'Strong Match',
        resultLevel: 'high',
        description: 'Logos are identical.',
        numericScore: 0.9,
      };
      this.onClick = () => {};

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

      this.signal = {
        title: 'Logo Analysis',
        result: 'Strong Match',
        resultLevel: 'high',
        description: 'Logos are identical.',
        numericScore: 0.9,
      };
      this.onClick = () => assert.ok(true, 'onClick called');

      await render(hbs`
        <Storeknox::FakeApps::FindingsSignalRow
          @signal={{this.signal}}
          @onClick={{this.onClick}}
        />
      `);

      await click('[data-test-storeknoxFakeAppsFindingsSignalRow-expandBtn]');
    });

    test('it applies the result level CSS class based on resultLevel', async function (assert) {
      this.signal = {
        title: 'Package Analysis',
        result: 'No Match',
        resultLevel: 'low',
        description: 'Packages differ.',
        numericScore: 0.2,
      };
      this.onClick = () => {};

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
