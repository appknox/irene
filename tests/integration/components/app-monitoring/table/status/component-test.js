import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | app-monitoring/table/status',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      this.set('status', 'not-found');

      await render(
        hbs`<AppMonitoring::Table::Status @status={{this.status}} />`
      );

      assert.dom(`[data-test-status=not-found]`).exists();
      assert.dom(`[data-test-status=not-found]`).hasText('not found');

      this.set('status', 'is-active');

      assert.dom(`[data-test-status=is-active]`).exists();
      assert.dom(`[data-test-status=is-active]`).hasText('is active');

      this.set('status', 'pending');

      assert.dom(`[data-test-status=pending]`).exists();
      assert.dom(`[data-test-status=pending]`).hasText('pending');
    });
  }
);
