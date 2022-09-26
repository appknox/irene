import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';

import { module, test } from 'qunit';

module(
  'Integration | Component | app-monitoring/table/status',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    test('it should render alert', async function (assert) {
      await render(
        hbs`<AppMonitoring::Table::Status  @condition='alert'>Test</AppMonitoring::Table::Status>`
      );
      assert.dom(`[data-test-am-status=alert]`).exists();
      assert.dom(`[data-test-am-status=alert]`).containsText('Test');
    });
    test('it should render warning', async function (assert) {
      await render(
        hbs`<AppMonitoring::Table::Status  @condition='warning'>Test</AppMonitoring::Table::Status>`
      );
      assert.dom(`[data-test-am-status=warning]`).exists();
      assert.dom(`[data-test-am-status=warning]`).containsText('Test');
    });
    test('it should render success', async function (assert) {
      await render(
        hbs`<AppMonitoring::Table::Status  @condition='success'>Test</AppMonitoring::Table::Status>`
      );
      assert.dom(`[data-test-am-status=success]`).exists();
      assert.dom(`[data-test-am-status=success]`).containsText('Test');
    });

    test('it should render yielded string', async function (assert) {
      await render(
        hbs`<AppMonitoring::Table::Status  @condition='alert'>TestRandom</AppMonitoring::Table::Status>`
      );
      assert.dom(`[data-test-am-status=alert]`).exists();
      assert.dom(`[data-test-am-status=alert]`).containsText('TestRandom');
    });
  }
);
