import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | production-scan/table/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test('it renders five table headers/columns', async function (assert) {
      await render(hbs`<ProductionScan::Table::Header />`);
      assert.dom(`[data-test-table-header-container]`).exists();
      assert.strictEqual(
        this.element.querySelectorAll(`[data-test-table-header]`).length,
        5,
        'Should have five (5) table headers'
      );
    });

    // TODO: Complete test

    // eslint-disable-next-line qunit/no-commented-tests
    // test('it displays status tooltip when info icon is hovered on', async function (assert) {
    //   await render(hbs`<ProductionScan::Table::Header />`);
    //   assert.dom(`[data-test-table-header-container]`).exists();
    //   assert.strictEqual(
    //     this.element.querySelectorAll(`[data-test-table-header]`).length,
    //     5,
    //     'Should have five (5) table headers'
    //   );

    //   assert.dom(`[data-test-tooltip-content]`).isNotVisible();

    //   await triggerEvent(
    //     this.element.querySelector('[data-test-tooltip-container]'),
    //     'mouseover'
    //   );

    //   assert.dom(`[data-test-tooltip-content]`).isVisible();
    // });
  }
);
