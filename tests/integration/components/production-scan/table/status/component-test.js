import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | production-scan/table/status',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      this.set('status', 'not-found');

      await render(
        hbs`<ProductionScan::Table::Status @status={{this.status}} />`
      );

      assert.dom(`[data-test-status=not-found]`).exists();
      assert.dom(`[data-test-status=not-found]`).hasText('not found');

      this.set('status', 'completed');

      assert.dom(`[data-test-status=completed]`).exists();
      assert.dom(`[data-test-status=completed]`).hasText('completed');

      this.set('status', 'not-initiated');

      assert.dom(`[data-test-status=not-initiated]`).exists();
      assert.dom(`[data-test-status=not-initiated]`).hasText('not initiated');
    });
  }
);
